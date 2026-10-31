import re
import os
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.config import DATASET_PATH

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
                if md_file.name.lower() in ("readme.md", "data_dictionary.md", "zip_schema.md"):
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
            elif "guide" in fn:
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
        Retrieves top relevant evidence chunks adhering strictly to policy precedence:
        Current policies (v4) > Agent guides > Help docs > FAQs > Marketing.
        pol_returns_v4.md always supersedes pol_returns_v3_superseded.md.
        """
        query_words = set(re.findall(r"\w+", query.lower()))
        if not query_words:
            return []

        scored_chunks = []
        for chunk in self.chunks:
            # Check for superseded document penalty
            if not chunk["is_active_policy"]:
                continue  # Never retrieve superseded policies for active customer queries

            chunk_text = chunk["text"].lower()
            chunk_words = set(re.findall(r"\w+", chunk_text))

            # Word overlap calculation
            overlap = query_words.intersection(chunk_words)
            if not overlap:
                continue

            base_score = len(overlap) / (len(query_words) + 1.0)

            # Apply category precedence weight
            cat = chunk.get("category", "current_policy")
            weight = CATEGORY_WEIGHTS.get(cat, 1.0)
            final_score = base_score * weight

            # Bonus for exact key phrase matches (e.g. "return", "refund", "electronics", "7-day")
            for term in ["return", "refund", "calendar day", "business day", "bangalore", "damage", "earbuds", "open-box"]:
                if term in query.lower() and term in chunk_text:
                    final_score += 0.35

            scored_chunks.append({
                "chunk": chunk,
                "score": final_score,
            })

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        top = scored_chunks[:top_k]

        results = []
        for item in top:
            c = item["chunk"]
            results.append({
                "doc_id": c["doc_id"],
                "doc_name": c["doc_name"],
                "title": c["title"],
                "section_id": c["section_id"],
                "category": c["category"],
                "relevance_score": min(0.99, round(item["score"], 2)),
                "text": c["text"],
                "effective_date": c["effective_date"],
                "is_active_policy": c["is_active_policy"],
                "precedence_note": "Governed by active policy v4" if "v4" in c["doc_id"] else None,
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
