from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import OrderLookupRequest, OrderLookupResponse
from app.services.order_service import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("")
async def list_orders(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
):
    orders = order_service.get_all_orders(search=search, status=status, limit=limit, offset=offset)
    return {
        "count": len(orders),
        "limit": limit,
        "offset": offset,
        "orders": orders,
    }

@router.post("/lookup", response_model=OrderLookupResponse)
async def lookup_order(req: OrderLookupRequest):
    result = order_service.lookup_order(
        order_id=req.order_id,
        verification_credential=req.verification_credential,
    )
    return OrderLookupResponse(**result)
