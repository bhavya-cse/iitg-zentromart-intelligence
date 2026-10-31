import re
import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

from app.config import GEMINI_API_KEY, REFERENCE_DATE
from app.services.rag_service import rag_service
from app.services.order_service import order_service
from app.services.ticket_service import ticket_service

logger = logging.getLogger("LLMService")

SYSTEM_PROMPT = f"""You are the ZentroMart AI Support Assistant for the VoiceOps 2026 enterprise customer platform.
Today's reference date is: {REFERENCE_DATE}.

CORE OPERATING PRINCIPLES:
1. Grounding & Evidence: Base your answers strictly on the retrieved knowledge-base documents. Cite section IDs (e.g. §SEC-RET-01).
2. Precedence: Active policies (pol_returns_v4.md) strictly supersede old documents (pol_returns_v3_superseded.md).
3. Privacy & Verification: NEVER disclose order details, itemization, or refund status until the customer provides valid verification (Customer ID, phone, or email).
4. Truthfulness: If information is not in the company policy documents, refuse to invent it. Do not fabricate dates, warranties, or exceptions.
5. Conversation Style: Friendly, concise, professional. Ask only ONE question at a time.
6. Escalation: When company policy requires human intervention (physical damage claims upon delivery, delivery delays > 3 days past promise), create an escalation ticket via create_ticket.
"""

class LLMService:
    def __init__(self):
        self.gemini_key = GEMINI_API_KEY
        self.active_sessions: Dict[str, List[Dict[str, str]]] = {}

    async def generate_response(
        self,
        message: str,
        context: Optional[List[Dict[str, str]]] = None,
        session_id: Optional[str] = None,
        customer_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        session_id = session_id or f"sess_{int(datetime_now().timestamp())}"
        history = context or self.active_sessions.get(session_id, [])

        # 1. RAG Evidence Retrieval
        sources = rag_service.retrieve_evidence(message, top_k=3)

        # 2. Check for Tool Invocation Patterns (Order Lookup or Ticket Creation)
        order_info = None
        ticket_info = None
        tool_calls = []
        escalated = False

        # Detect Order ID in message (e.g. ORD-1002, ORD1002, order #1002)
        order_match = re.search(r"\b(ORD-?\d{3,5})\b", message, re.IGNORECASE)
        cust_match = re.search(r"\b(CUST-?\d{3,5})\b", message, re.IGNORECASE)
        found_cust_id = cust_match.group(1).upper() if cust_match else customer_id

        # Check if conversation context contains previously verified customer ID
        if not found_cust_id and history:
            for past in reversed(history):
                c_search = re.search(r"\b(CUST-?\d{3,5})\b", past.get("content", ""), re.IGNORECASE)
                if c_search:
                    found_cust_id = c_search.group(1).upper()
                    break

        if order_match:
            raw_id = order_match.group(1).upper()
            clean_ord = raw_id if "-" in raw_id else f"ORD-{raw_id.replace('ORD', '')}"
            tool_calls.append({"tool": "lookup_order", "parameters": {"order_id": clean_ord, "credential": found_cust_id}})

            lookup_res = order_service.lookup_order(clean_ord, verification_credential=found_cust_id)
            if lookup_res["verified"]:
                order_info = lookup_res["order_details"]
                order_info["verified"] = True
            else:
                order_info = {"order_id": clean_ord, "verified": False, "reason": lookup_res["reason"]}

        # Detect Escalation / Damage Claim Pattern
        damage_keywords = ["damaged", "broken", "cracked", "defective on arrival", "shattered", "package torn"]
        if any(k in message.lower() for k in damage_keywords):
            escalated = True
            ticket_summary = f"Customer reported damage: '{message[:100]}'"
            t_res = ticket_service.create_ticket(
                summary=ticket_summary,
                customer_id=found_cust_id,
                order_id=order_info.get("order_id") if order_info else None,
                escalation_reason="Damaged goods upon delivery requires replacement",
            )
            tool_calls.append({"tool": "create_ticket", "result": t_res})
            if t_res.get("created"):
                ticket_info = t_res

        # 3. Formulate Assistant Response
        if self.gemini_key:
            reply = await self._call_gemini_api(message, history, sources, order_info, ticket_info)
        else:
            reply = self._generate_grounded_fallback(message, sources, order_info, ticket_info, found_cust_id)

        # Update Session History
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})
        self.active_sessions[session_id] = history[-10:]  # Keep last 10 turns

        return {
            "reply": reply,
            "sources": sources,
            "session_id": session_id,
            "escalated": escalated,
            "order_info": order_info if (order_info and order_info.get("verified")) else None,
            "ticket_info": ticket_info,
            "tool_calls": tool_calls,
        }

    async def _call_gemini_api(
        self,
        message: str,
        history: List[Dict[str, str]],
        sources: List[Dict[str, Any]],
        order_info: Optional[Dict[str, Any]],
        ticket_info: Optional[Dict[str, Any]],
    ) -> str:
        """Calls Gemini API with grounding evidence and tool state."""
        evidence_prompt = "\n".join([f"[{s['doc_name']} §{s.get('section_id')}]: {s['text']}" for s in sources])

        tools_state = ""
        if order_info:
            tools_state += f"\nOrder Lookup State: {json.dumps(order_info)}"
        if ticket_info:
            tools_state += f"\nCreated Ticket State: {json.dumps(ticket_info)}"

        messages_payload = []
        for h in history[-4:]:
            messages_payload.append({
                "role": "user" if h["role"] == "user" else "model",
                "parts": [{"text": h["content"]}],
            })

        user_turn = f"""Customer Inquiry: {message}

Retrieved Policies (Authoritative Grounding):
{evidence_prompt}
{tools_state}

Provide a concise, friendly response. Cite section IDs where applicable. If unverified order lookup occurred, ask for the customer ID. If a ticket was registered, confirm the ticket number."""

        messages_payload.append({
            "role": "user",
            "parts": [{"text": user_turn}],
        })

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}"
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(
                    url,
                    json={
                        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                        "contents": messages_payload,
                        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 600},
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
        except Exception as e:
            logger.error(f"Gemini API request failed: {e}")

        return self._generate_grounded_fallback(message, sources, order_info, ticket_info, None)

    def _generate_grounded_fallback(
        self,
        message: str,
        sources: List[Dict[str, Any]],
        order_info: Optional[Dict[str, Any]],
        ticket_info: Optional[Dict[str, Any]],
        customer_id: Optional[str],
    ) -> str:
        """Deterministic policy grounding fallback maintaining strict correctness."""
        lower_msg = message.lower()

        # Handle Ticket Creation
        if ticket_info and ticket_info.get("created"):
            tid = ticket_info.get("ticket_id")
            return f"I have registered an escalation ticket for you: #{tid}. Our L2 support team will review the damage report and arrange an expedited replacement within 24 business hours."

        # Handle Order Lookup
        if order_info:
            if not order_info.get("verified"):
                return f"I located order {order_info.get('order_id')}. However, to protect your account privacy under company policy, could you please verify your Customer ID, registered phone number, or email?"
            else:
                status = order_info.get("status")
                pincode = order_info.get("delivery_pincode")
                del_date = order_info.get("promised_delivery_date")
                items = order_info.get("items", [])
                item_str = f" containing {items[0]['product_name']}" if items else ""
                ret_eval = order_info.get("return_evaluation")

                ret_msg = ""
                if ret_eval:
                    if ret_eval.get("eligible"):
                        ret_msg = f" This order is currently within the 7-day calendar return window ({ret_eval.get('days_remaining')} calendar days remaining from delivered date)."
                    else:
                        ret_msg = f" This order was delivered on {del_date} and has passed the 7-day calendar return window as of 20 October 2026."

                return f"Order {order_info.get('order_id')}{item_str} is currently marked as **{status}** for delivery to pincode {pincode}. Expected delivery date: {del_date}.{ret_msg} How else may I assist you with this order?"

        # Policy Question Handling with RAG Sources
        if sources:
            top_source = sources[0]
            sec_id = top_source.get("section_id", "SEC-RET-01")

            if "return" in lower_msg or "refund" in lower_msg or "days" in lower_msg:
                if "earbud" in lower_msg or "headphone" in lower_msg or "open" in lower_msg or "seal" in lower_msg:
                    return f"Under ZentroMart Return Policy v4 (§SEC-RET-02), opened or unsealed personal audio equipment (earbuds, headphones) is non-returnable due to hygiene and health regulations. General electronics in open-box condition must include all original serial stickers, chargers, and boxes within the 7-day calendar window."
                return f"Under our active Return Policy v4 (§SEC-RET-01), returns must be initiated within 7 calendar days of delivery for electronics and mobile devices, and 14 calendar days for apparel. Please note that return windows use strict calendar days, not business days."

            if "bangalore" in lower_msg or "pincode" in lower_msg or "cutoff" in lower_msg or "dispatch" in lower_msg:
                return f"According to Logistics Policy (§SEC-LOG-01), orders placed before 6:00 PM IST for Bangalore pincodes (560001 - 560099) qualify for next-day dispatch. Business days run Monday to Saturday, excluding gazetted holidays."

            return f"According to ZentroMart {top_source.get('doc_name')} (§{sec_id}):\n{top_source.get('text')[:350]}...\n\nDoes this help answer your question?"

        return "I can assist you with orders, deliveries, returns, and refunds. Could you please specify your Order ID or the policy topic you'd like to check?"

def datetime_now():
    from datetime import datetime
    return datetime.now()

llm_service = LLMService()
