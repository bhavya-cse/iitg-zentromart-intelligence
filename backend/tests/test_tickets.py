import pytest
from app.services.ticket_service import ticket_service

def test_create_ticket_success():
    res = ticket_service.create_ticket(
        summary="Customer received damaged item upon delivery",
        customer_id="CUST-104",
        order_id="ORD-1002",
        escalation_reason="Damaged goods",
    )
    assert res["created"] is True
    assert res["ticket_id"].startswith("TCK-")
    assert "successfully registered" in res["message"]

def test_create_ticket_empty_summary_rejected():
    res = ticket_service.create_ticket("")
    assert res["created"] is False
    assert res["ticket_id"] == ""
