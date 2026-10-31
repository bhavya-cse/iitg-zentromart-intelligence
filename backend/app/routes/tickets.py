from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import TicketCreateRequest, TicketCreateResponse
from app.services.ticket_service import ticket_service

router = APIRouter(prefix="/tickets", tags=["Support Tickets"])

@router.get("")
async def list_tickets(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    tickets = ticket_service.get_all_tickets(status=status, search=search)
    return {"total": len(tickets), "tickets": tickets}

@router.post("", response_model=TicketCreateResponse)
async def create_support_ticket(req: TicketCreateRequest):
    res = ticket_service.create_ticket(
        summary=req.summary,
        customer_id=req.customer_id,
        order_id=req.order_id,
        escalation_reason=req.escalation_reason,
    )
    if not res.get("created"):
        raise HTTPException(status_code=400, detail=res.get("message", "Ticket creation failed."))
    return TicketCreateResponse(**res)
