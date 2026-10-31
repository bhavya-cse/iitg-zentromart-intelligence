import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

from app.config import STORAGE_DIR

logger = logging.getLogger("TicketService")
TICKETS_FILE = STORAGE_DIR / "tickets.json"

class TicketService:
    def __init__(self):
        self._ensure_storage()

    def _ensure_storage(self):
        if not TICKETS_FILE.exists():
            with open(TICKETS_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)

    def get_all_tickets(self, status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        self._ensure_storage()
        try:
            with open(TICKETS_FILE, "r", encoding="utf-8") as f:
                tickets = json.load(f)
        except Exception as e:
            logger.error(f"Error reading tickets file: {e}")
            tickets = []

        if status and status.lower() != "all":
            tickets = [t for t in tickets if t.get("status", "").lower() == status.lower()]

        if search:
            s = search.strip().lower()
            tickets = [
                t for t in tickets
                if s in t.get("ticket_id", "").lower()
                or s in t.get("summary", "").lower()
                or s in str(t.get("customer_id", "")).lower()
                or s in str(t.get("order_id", "")).lower()
            ]

        # Sort newest first
        tickets.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return tickets

    def create_ticket(
        self,
        summary: str,
        customer_id: Optional[str] = None,
        order_id: Optional[str] = None,
        escalation_reason: Optional[str] = "Policy requires human intervention",
    ) -> Dict[str, Any]:
        """
        Supplied VoiceOps tool: create_ticket(summary)
        The AI should create tickets when company policy requires human intervention.
        Only confirm ticket creation after the actual tool returns created=True.
        """
        if not summary or not summary.strip():
            return {
                "created": False,
                "ticket_id": "",
                "summary": "",
                "message": "Ticket summary cannot be empty.",
                "timestamp": datetime.now().isoformat(),
            }

        self._ensure_storage()
        tickets = self.get_all_tickets()

        # Generate ticket ID: TCK-1001, etc.
        existing_nums = []
        for t in tickets:
            tid = t.get("ticket_id", "")
            if tid.startswith("TCK-"):
                try:
                    existing_nums.append(int(tid.split("-")[1]))
                except ValueError:
                    pass

        next_num = max(existing_nums, default=1000) + 1
        ticket_id = f"TCK-{next_num}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        new_ticket = {
            "ticket_id": ticket_id,
            "summary": summary.strip(),
            "customer_id": customer_id.strip() if customer_id else None,
            "order_id": order_id.strip() if order_id else None,
            "escalation_reason": escalation_reason or "Policy requires human intervention",
            "status": "Open",
            "resolution_status": "Assigned to L2 Support Specialist",
            "created_at": timestamp,
        }

        tickets.append(new_ticket)
        try:
            with open(TICKETS_FILE, "w", encoding="utf-8") as f:
                json.dump(tickets, f, indent=2)
            logger.info(f"Created ticket {ticket_id}: {summary[:40]}")
        except Exception as e:
            logger.error(f"Error saving ticket: {e}")
            return {
                "created": False,
                "ticket_id": "",
                "summary": summary,
                "message": f"Storage error: {e}",
                "timestamp": timestamp,
            }

        return {
            "created": True,
            "ticket_id": ticket_id,
            "summary": summary.strip(),
            "message": f"Support ticket #{ticket_id} has been successfully registered with human operations.",
            "timestamp": timestamp,
            "ticket_record": new_ticket,
        }

ticket_service = TicketService()
