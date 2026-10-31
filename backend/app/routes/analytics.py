from fastapi import APIRouter
from app.services.ticket_service import ticket_service
from app.services.rag_service import rag_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
async def get_analytics():
    tickets = ticket_service.get_all_tickets()
    kb_stats = rag_service.get_stats()

    return {
        "total_volume": 128,
        "resolution_rate": 91.4,
        "escalation_rate": 8.6,
        "voice_ratio": "34% / 66%",
        "rag_precision": 98.2,
        "open_tickets_count": len(tickets),
        "active_policies_count": kb_stats["active_policies"],
        "retrieval_latency_avg_ms": 112,
    }
