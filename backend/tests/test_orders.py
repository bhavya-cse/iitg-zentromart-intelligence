import pytest
from app.services.order_service import order_service
from app.services.dataset_service import dataset_service

def test_lookup_order_requires_verification():
    # Attempting to lookup without credential must return verified=False
    res = order_service.lookup_order("ORD-1002")
    assert res["verified"] is False
    assert "verification is required" in res["reason"].lower()
    assert res["order_details"] is None

def test_return_window_evaluation_calendar_days():
    # Delivered on 2026-10-15; reference date is 2026-10-20 (5 days passed <= 7 days)
    res = dataset_service.evaluate_return_window("2026-10-15", window_days=7)
    assert res["eligible"] is True
    assert res["days_passed"] == 5
    assert res["days_remaining"] == 2

def test_return_window_expired():
    # Delivered on 2026-10-10; reference date is 2026-10-20 (10 days passed > 7 days)
    res = dataset_service.evaluate_return_window("2026-10-10", window_days=7)
    assert res["eligible"] is False
    assert res["days_passed"] == 10
    assert res["days_remaining"] == 0
