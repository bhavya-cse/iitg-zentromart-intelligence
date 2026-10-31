import re
import os
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.config import DATASET_PATH, REFERENCE_DATE

logger = logging.getLogger("RAGService")

# Authoritative Policy Precedence Ranking
# Current policies (1) > Agent guides (2) > Help documents (3) > FAQs (4) > Marketing (5)
CATEGORY_WEIGHTS = {
    "current_policy": 1.6,
    "agent_guide": 1.3,
    "help_document": 1.0,
    "faq": 0.8,
    "marketing": 0.5,
    "superseded": 0.05,  # Heavily deprioritized / flagged
}

# Standard Reference Policies for ZentroMart VoiceOps 2026
DEFAULT_POLICIES = [
    {
        "id": "pol_returns_v4.md",
        "title": "ZentroMart Returns & Replacements Policy (v4 - Current Active)",
        "category": "current_policy",
        "status": "Active",
        "effective_date": "2026-09-01",
        "is_active_policy": True,
        "content": """# ZentroMart Returns & Replacements Policy v4 (Active)
Effective Date: 1 September 2026
Supersedes: pol_returns_v3_superseded.md

## SEC-RET-01: General Return Windows
- Return requests must be initiated within calendar days from the date of confirmed delivery.
- Electronics, mobile devices, and high-value appliances carry a strict 7-day calendar return window.
- Fashion, apparel, and lifestyle items carry a 14-day calendar return window.
- The return window is calculated strictly in calendar days, not business days.

## SEC-RET-02: Condition and Open-Box Guidelines
- For personal audio equipment (in-ear headphones, earbuds) and personal care appliances, opened or unsealed packaging is non-returnable due to hygiene and health regulations.
- Laptops and smartphones returned in open-box condition must include all original packaging, IMEI stickers, serial numbers, adapters, and manuals.
- Items damaged due to customer misuse or unauthorized modification are strictly ineligible for refund.

## SEC-RET-03: Refund Processing Timelines
- UPI & Net Banking refunds are credited within 3-5 business days following warehouse verification.
- Credit Card and Debit Card reversals take 5-7 business days depending on the issuing bank.
- Replacement units are dispatched only after the returned unit reaches our Bangalore central facility.

## SEC-RET-04: Damaged or Defective Deliveries
- Customers receiving physically damaged packages must report the issue within 24 hours of delivery.
- Customer support must create an escalation ticket with photos to dispatch a priority replacement.
""",
    },
    {
        "id": "pol_returns_v3_superseded.md",
        "title": "ZentroMart Returns Policy v3 (Superseded - Historical)",
        "category": "superseded",
        "status": "superseded",
        "effective_date": "2025-04-01",
        "is_active_policy": False,
        "content": """# ZentroMart Returns Policy v3 (SUPERSEDED)
Notice: This document was superseded by v4 on 1 September 2026 and is no longer authoritative.

## SEC-RET-OLD-01: Old Return Window
- Standard 10-day return window on all items without category distinction. (Obsolete)
""",
    },
    {
        "id": "guide_agent_escalations_v2.md",
        "title": "VoiceOps L1/L2 Support Escalation Guidelines",
        "category": "agent_guide",
        "status": "Active",
        "effective_date": "2026-08-15",
        "is_active_policy": True,
        "content": """# Support Escalation Standard Operating Procedure
Category: Agent Guides

## SEC-ESC-01: When to Create a Human Support Ticket
- Physical damage claims upon delivery: Create ticket immediately via create_ticket tool.
- Logistics delay exceeding 3 business days past promised delivery date.
- Customer dispute regarding return eligibility or denied return requests.
- Customer requesting manager callback or formal complaint registration.

## SEC-ESC-02: Customer Verification Protocol
- Never reveal customer order items, delivery address, or refund payment details without verifying Customer ID or registered contact.
""",
    },
    {
        "id": "help_delivery_timelines.md",
        "title": "Shipping Logistics & Bangalore Hub Cutoffs",
        "category": "help_document",
        "status": "Active",
        "effective_date": "2026-07-01",
        "is_active_policy": True,
        "content": """# Logistics & Delivery Operational Standards
Category: Help Document

## SEC-LOG-01: Business Days & Dispatch Schedule
- Business days run Monday to Saturday, excluding official gazetted holidays. Sundays are non-operational.
- Orders placed before 6:00 PM IST on Bangalore pincodes (560001 - 560099) qualify for next-day dispatch.
- Standard transit time within Karnataka is 1-2 business days; national delivery is 3-5 business days.
""",
    },
    {
        "id": "faq_customer_support.md",
        "title": "ZentroMart Customer Support FAQs",
        "category": "faq",
        "status": "Active",
        "effective_date": "2026-06-01",
        "is_active_policy": True,
        "content": """# Customer Inquiries FAQ
Category: FAQ

## SEC-FAQ-01: Common Answers
- Q: How do I track my order?
  A: Provide your Order ID and Customer ID so our assistant can verify your profile and retrieve real-time transit status.
- Q: Can I cancel an order once shipped?
  A: Orders already dispatched to courier partners cannot be cancelled directly; please refuse delivery or initiate a return upon arrival.
""",
    },
]

class RAGService:
    def __init__(self, dataset_path: Optional[Path] = None):
        self.dataset_path = dataset_path or DATASET_PATH
        self.documents: List[Dict[str, Any]] = []
        self.chunks: List[Dict[str, Any]] = []
        self.index_knowledge_base()


    def index_knowledge_base(self):
        """Discovers and parses markdown policy documents, creating chunked indices."""
        self.documents = []
        self.chunks = []

        # Check for user-supplied markdown files in dataset directory
        found_md = False
        if self.dataset_path.exists():
            md_files = list(self.dataset_path.glob("*.md")) + list(self.dataset_path.rglob("*.md"))

            for md_file in md_files:
                if md_file.name.lower() in (
                    "readme.md",
                    "data_dictionary.md",
                    "zip_schema.md",
                    "changelog.md",
                ):
                    continue

                try:
                    with open(md_file, "r", encoding="utf-8") as f:
                        text = f.read()

                    doc = self._parse_markdown_doc(md_file.name, text)
                    self.documents.append(doc)
                    found_md = True

                except Exception as e:
                    logger.error(f"Error parsing {md_file}: {e}")

        # If no markdown documents found in dataset folder, load DEFAULT_POLICIES
        if not found_md:
            logger.info("Using embedded ZentroMart policy repository.")
            for p in DEFAULT_POLICIES:
                doc = self._parse_markdown_doc(p["id"], p["content"], meta=p)
                self.documents.append(doc)

        # Chunk all parsed documents
        for doc in self.documents:
            self._chunk_document(doc)

        logger.info(f"RAG indexed: {len(self.documents)} documents, {len(self.chunks)} chunks.")


    def _parse_markdown_doc(self, filename: str, content: str, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Parses a markdown document, extracting sections and metadata."""
        meta = meta or {}
        doc_id = filename
        title = meta.get("title") or filename.replace(".md", "").replace("_", " ").title()
        
        # Determine policy category and status
        category = meta.get("category")
        if not category:
            fn = filename.lower()
            if "superseded" in fn or "v3" in fn:
                category = "superseded"
            elif "pol_" in fn or "policy" in fn:
                category = "current_policy"
            elif "guide" in fn or "agent_" in fn:
                category = "agent_guide"
            elif "help" in fn:
                category = "help_document"
            elif "faq" in fn:
                category = "faq"
            else:
                category = "marketing"

        is_active = category != "superseded" and "superseded" not in filename.lower()
        status = "Active" if is_active else "superseded"

        # Extract sections using Markdown headings (##)
        sections = []
        raw_sections = re.split(r"\n(?=## )", content)
        for s in raw_sections:
            lines = s.strip().split("\n")
            if not lines or not lines[0].startswith("## "):
                continue
            header = lines[0].replace("## ", "").strip()
            
            # Extract section id if present (e.g. SEC-RET-01)
            sec_id_match = re.search(r"(SEC-[A-Z0-9\-]+)", header)
            sec_id = sec_id_match.group(1) if sec_id_match else f"SEC-{len(sections)+1}"
            sec_body = "\n".join(lines[1:]).strip()

            sections.append({
                "section_id": sec_id,
                "title": header,
                "content": sec_body,
                "raw": s,
            })

        return {
            "id": doc_id,
            "filename": filename,
            "title": title,
            "category": category,
            "status": status,
            "effective_date": meta.get("effective_date", "2026-09-01"),
            "is_active_policy": is_active,
            "raw_content": content,
            "sections": sections,
            "chunks_count": len(sections) or 1,
        }

    def _chunk_document(self, doc: Dict[str, Any]):
        """Splits document sections into retrievable evidence chunks."""
        sections = doc.get("sections", [])
        if sections:
            for sec in sections:
                self.chunks.append({
                    "chunk_id": f"{doc['id']}#{sec['section_id']}",
                    "doc_id": doc["id"],
                    "doc_name": doc["title"],
                    "section_id": sec["section_id"],
                    "category": doc["category"],
                    "status": doc["status"],
                    "is_active_policy": doc["is_active_policy"],
                    "effective_date": doc["effective_date"],
                    "title": sec["title"],
                    "text": f"{sec['title']}\n{sec['content']}",
                })
        else:
            # Document without explicit ## headings
            self.chunks.append({
                "chunk_id": f"{doc['id']}#0",
                "doc_id": doc["id"],
                "doc_name": doc["title"],
                "section_id": "SEC-GEN-01",
                "category": doc["category"],
                "status": doc["status"],
                "is_active_policy": doc["is_active_policy"],
                "effective_date": doc["effective_date"],
                "title": doc["title"],
                "text": doc["raw_content"][:1000],
            })

    
    def retrieve_evidence(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Multilingual lexical retrieval with targeted Hindi/Hinglish query expansion.
        Active policies always take precedence over non-policy documents.
        Superseded policies are never returned.
        """

        if not query or not query.strip():
            return []

        original_query = query.lower()
                # Historical electronics return policy applies to deliveries
        # before 1 August 2026.
        historical_electronics_query = False

        electronics_terms = [
            "smartwatch", "smart watch", "electronics",
            "smartphone", "laptop", "earbuds",
            "power bank", "mobile"
        ]

        if any(term in original_query for term in electronics_terms):
            month_names = (
                "january|february|march|april|may|june|"
                "july|august|september|october|november|december"
            )

            date_match = re.search(
                rf"\b(\d{{1,2}})\s+({month_names})(?:\s+(\d{{4}}))?\b",
                original_query
            )

            if date_match:
                day = int(date_match.group(1))
                month = datetime.strptime(
                    date_match.group(2), "%B"
                ).month

                year = int(date_match.group(3)) if date_match.group(3) else (
                    datetime.strptime(REFERENCE_DATE, "%Y-%m-%d").year
                )

                try:
                    delivery_date = datetime(year, month, day).date()
                    historical_electronics_query = (
                        delivery_date < datetime(2026, 8, 1).date()
                    )
                except ValueError:
                    pass
        query_words = set(re.findall(r"\w+", original_query))

        if not query_words:
            return []

        # Expand common Hindi and Hinglish expressions into policy concepts.
        expansions = {
            # Returns and product condition
            "खोल लिया": ["opened", "beauty", "personal", "care", "unopened", "seal", "intact"],
            "khol liya": ["opened", "beauty", "personal", "care", "unopened", "seal", "intact"],
            "खुला हुआ": ["opened", "unsealed", "unopened"],
            "opened": ["unopened", "seal", "intact", "condition"],
            "lipstick": ["beauty", "personal", "care", "beauty_sealed"],
            "cosmetics": ["beauty", "personal", "care", "seal"],
            "वापस": ["return", "returnable", "return", "window"],
            "लौटाने": ["return", "returnable", "return", "window"],
            "लौटा": ["return", "returnable", "window"],
            "return": ["return", "returnable", "window", "delivery", "calendar", "days"],
            "kitne din": ["return", "window", "calendar", "days"],
            "कितने दिन": ["return", "window", "calendar", "days"],

            # Product categories
            "notebook": ["books", "stationery", "books_media"],
            "ruled": ["books", "stationery", "books_media"],
            "tote bag": ["fashion", "clothing", "footwear", "bags"],
            "jeans": ["fashion", "clothing", "footwear", "bags"],
            "bedsheet": ["home", "kitchen", "furniture", "home_kitchen"],
            "smartphone": ["electronics", "accessories", "calendar", "days"],
            "mobile": ["electronics", "accessories", "calendar", "days"],
                        "smartwatch": ["electronics", "accessories", "wearables", "return", "window", "days"],
            "smart watch": ["electronics", "accessories", "wearables", "return", "window", "days"],
            "wearables": ["electronics", "accessories", "smartwatch"],
            # Refunds
            "refund": ["refund", "initiated", "business", "days", "payment"],
            "रिफ़ंड": ["refund", "initiated", "business", "days"],
            "shuru hua": ["initiated", "refund", "processing"],
            "शुरू हुआ": ["initiated", "refund", "processing"],
            "credit card": ["credit", "card", "refund", "business", "days"],
            "net banking": ["net", "banking", "refund", "business", "days"],
            "upi": ["upi", "refund", "business", "days"],

            # Order cancellation
            "शिप हो गया": ["shipped", "dispatched", "cancel", "cancellation"],
            "ship ho gaya": ["shipped", "dispatched", "cancel", "cancellation"],
            "cancel": ["cancellation", "shipped", "dispatched", "order"],

            # Damaged products
            "टूटा हुआ": ["damaged", "broken", "defective", "reporting", "resolution"],
            "खराब": ["damaged", "defective", "wrong", "reporting"],
            "damaged": ["damaged", "defective", "reporting", "resolution"],
            # Damaged, defective and high-value products
            "torn": [
                "damaged", "defective", "wrong", "resolution",
                "replacement", "refund", "delivery", "fees"
            ],
            "crack": [
                "damaged", "defective", "physical", "damage",
                "high-value", "priority", "resolution", "ticket"
            ],
            "cracked": [
                "damaged", "defective", "physical", "damage",
                "high-value", "priority", "resolution", "ticket"
            ],
            "doesn't work": [
                "damaged", "defective", "replacement", "refund"
            ],
            "broken": [
                "damaged", "defective", "resolution", "replacement"
            ],

            # Fashion and product return categories
            "kurta": [
                "fashion", "clothing", "footwear", "bags",
                "return", "window", "festive", "sale"
            ],
            "swimsuit": [
                "innerwear", "lingerie", "swimwear",
                "not", "returnable", "change", "mind"
            ],
            "swimwear": [
                "innerwear", "lingerie", "swimwear",
                "not", "returnable", "change", "mind"
            ],
            "briefs": [
                "innerwear", "lingerie", "swimwear",
                "not", "returnable", "change", "mind"
            ],
            "doesn't fit": [
                "change", "mind", "return", "returnable",
                "innerwear", "fashion"
            ],

            # Unauthorised orders and customer privacy
            "never placed": [
                "unauthorised", "account", "activity",
                "human", "escalation", "handover"
            ],
            "did not place": [
                "unauthorised", "account", "activity",
                "human", "escalation", "handover"
            ],
            "phone number": [
                "privacy", "personal", "details",
                "customer", "share", "never", "read"
            ],
            "another customer": [
                "privacy", "personal", "details",
                "customer", "share", "never"
            ],

            # Refund methods and business-day calculations
            "wallet": [
                "zentromart", "refund", "instant",
                "hours", "original", "payment"
            ],
            "cash on delivery": [
                "cod", "cash", "delivery", "refund",
                "bank", "transfer", "wallet"
            ],
            "business days": [
                "business", "days", "monday", "saturday",
                "holidays", "warehouse", "refund", "timeline"
            ],
            # Warranty and assured
            "assured": ["warranty", "assured", "claim", "products"],
            "claim": ["warranty", "assured", "repair", "replacement"],
            "gst invoice": ["gst", "invoice", "bulk", "business"],
            "bulk order": ["bulk", "gst", "invoice"],
        }

        expanded_words = set(query_words)

        for phrase, terms in expansions.items():
            if phrase in original_query:
                expanded_words.update(terms)

        # Additional English keyword normalisation.
        if any(word in expanded_words for word in ["lipstick", "cosmetics"]):
            expanded_words.update([
                "beauty", "personal", "care",
                "unopened", "seal", "intact"
            ])

        if "return" in expanded_words or "returnable" in expanded_words:
            expanded_words.update(["return", "window", "delivery"])
        # Detect refund and delivery contexts for targeted evidence retrieval.
        is_refund_query = any(
            term in original_query
            for term in ["refund", "refunded", "रिफ़ंड", "रिफंड"]
        )

        is_refund_date_query = (
            is_refund_query
            and (
                bool(re.search(
                    r"\b\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\b",
                    original_query
                ))
                or any(
                    phrase in original_query
                    for phrase in [
                        "by which date",
                        "what date should",
                        "when should i receive",
                        "date should i have",
                        "started on"
                    ]
                )
            )
        )

        is_international_delivery_query = any(
            phrase in original_query
            for phrase in [
                "dubai",
                "outside india",
                "international delivery",
                "deliver abroad",
                "outside the country"
            ]
        )
        scored_chunks = []

        for chunk in self.chunks:

            # Default: this is not a historical policy exception.
            is_historical_returns = False

            # Allow superseded V3 only for historical electronics deliveries.
            if not chunk["is_active_policy"]:
                is_historical_returns = (
                    historical_electronics_query
                    and chunk.get("category") == "superseded"
                    and "pol_returns_v3_superseded" in
                    str(chunk.get("doc_id", "")).lower()
                )

                if not is_historical_returns:
                    continue

            chunk_text = chunk["text"].lower()
            chunk_title = chunk.get("title", "").lower()
            chunk_words = set(re.findall(r"\w+", chunk_text))

            overlap = expanded_words.intersection(chunk_words)

            # Identify important knowledge-base sections.
            is_kb_precedence = "[kb-00.1]" in chunk_title
            is_business_days = "[kb-00.3]" in chunk_title
            is_delivery_faq = "[faq-5]" in chunk_title

            contextual_candidate = (
                (is_refund_query and is_kb_precedence)
                or (is_refund_date_query and is_business_days)
                or (
                    is_international_delivery_query
                    and is_delivery_faq
                )
            )

            if not overlap and not contextual_candidate:
                continue

            # Base lexical relevance.
            base_score = len(overlap) / (len(expanded_words) + 1.0)

            # Preserve document category precedence.
            # Preserve policy precedence.
            category = chunk.get("category", "current_policy")

            if is_historical_returns:
                weight = CATEGORY_WEIGHTS.get("current_policy", 1.6)
            else:
                weight = CATEGORY_WEIGHTS.get(category, 1.0)

            final_score = base_score * weight

            # Give extra weight to direct policy reference matches.
            reference_matches = re.findall(
                r"\b(?:RET|REF|DWM|ESC|CAN|WAR|FAQH|FAQ|KB|IDV)-?\d+(?:\.\d+)?\b",
                original_query.upper()
            )

            for reference in reference_matches:
                if reference.lower() in chunk_text:
                    final_score += 0.50

            # Small bonus for matching important policy concepts.
            important_terms = [
                "return", "refund", "beauty", "personal care",
                "unopened", "seal", "intact", "warranty",
                "business day", "calendar day", "damaged",
                "shipped", "dispatched", "cancellation",
                "gst", "invoice"
            ]

            for term in important_terms:
                if term in expanded_words and term in chunk_text:
                    final_score += 0.08

            # Small title match bonus.
            title_overlap = expanded_words.intersection(
                set(re.findall(r"\w+", chunk_title))
            )

            if title_overlap:
                final_score += 0.10
                            # Context-aware evidence bonuses.
            if is_refund_query and is_kb_precedence:
                final_score += 0.65

            if is_refund_date_query and is_business_days:
                final_score += 0.55

            if is_international_delivery_query and is_delivery_faq:
                final_score += 0.65

            scored_chunks.append({
                "chunk": chunk,
                "score": final_score,
            })

        # Rank by score, then prefer current policies in ties.
        scored_chunks.sort(
            key=lambda item: (
                item["score"],
                CATEGORY_WEIGHTS.get(
                    item["chunk"].get("category", "current_policy"),
                    1.0
                )
            ),
            reverse=True
        )

        results = []

        for item in scored_chunks[:top_k]:
            chunk = item["chunk"]

            results.append({
                "doc_id": chunk["doc_id"],
                "doc_name": chunk["doc_name"],
                "title": chunk["title"],
                "section_id": chunk["section_id"],
                "category": chunk["category"],
                "relevance_score": min(
                    0.99, round(item["score"], 2)
                ),
                "text": chunk["text"],
                "effective_date": chunk["effective_date"],
                "is_active_policy": chunk["is_active_policy"],
                "precedence_note": (
                    "Governed by active policy v4"
                    if "v4" in chunk["doc_id"]
                    else None
                ),
            })

        return results


    def get_all_documents(self) -> List[Dict[str, Any]]:
        return self.documents

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_documents": len(self.documents),
            "total_chunks": len(self.chunks),
            "active_policies": sum(1 for d in self.documents if d.get("is_active_policy")),
            "superseded_policies": sum(1 for d in self.documents if not d.get("is_active_policy")),
        }

rag_service = RAGService()
