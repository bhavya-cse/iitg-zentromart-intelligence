import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["product"] == "ZentroMart Intelligence"

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert "rag_ready" in data
    assert "reference_date" in data
    assert data["reference_date"] == "2026-10-20"

def test_overview_endpoint():
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "service_health" in data
    assert "frequently_asked_questions" in data

def test_chat_endpoint_policy_query():
    res = client.post("/api/chat", json={"message": "What is the return window for electronics?"})
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["sources"]) > 0

def test_orders_list():
    res = client.get("/api/orders")
    assert res.status_code == 200
    data = res.json()
    assert "orders" in data

def test_tickets_create_and_list():
    create_res = client.post("/api/tickets", json={
        "summary": "Damaged goods packaging test",
        "customer_id": "CUST-999",
        "escalation_reason": "Damaged package",
    })
    assert create_res.status_code == 200
    assert create_res.json()["created"] is True

    list_res = client.get("/api/tickets")
    assert list_res.status_code == 200
    assert list_res.json()["total"] > 0

def test_evaluation_endpoint():
    res = client.get("/api/evaluation")
    assert res.status_code == 200
    data = res.json()
    assert "step_1" in data
    assert "step_2" in data
