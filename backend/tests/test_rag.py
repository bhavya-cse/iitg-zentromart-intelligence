import pytest
from app.services.rag_service import rag_service

def test_rag_indexed_chunks():
    assert len(rag_service.chunks) > 0
    assert len(rag_service.documents) > 0

def test_policy_precedence_v4_over_v3_superseded():
    # Query for return window
    results = rag_service.retrieve_evidence("What is the return window for electronics?", top_k=3)
    assert len(results) > 0
    
    # Top result must be active v4 policy or active policy, never superseded v3
    top_doc = results[0]["doc_id"]
    assert "superseded" not in top_doc.lower()
    assert results[0]["is_active_policy"] is True

def test_section_id_extraction():
    results = rag_service.retrieve_evidence("earbuds hygiene open seal", top_k=2)
    assert len(results) > 0
    top = results[0]
    assert top.get("section_id") is not None
    assert "SEC-" in top.get("section_id")
