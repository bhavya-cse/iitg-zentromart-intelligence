from fastapi import APIRouter
from app.services.rag_service import rag_service

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])

@router.get("")
async def get_knowledge_base():
    docs = rag_service.get_all_documents()
    stats = rag_service.get_stats()
    return {
        "total_documents": stats["total_documents"],
        "total_chunks": stats["total_chunks"],
        "active_policies": stats["active_policies"],
        "documents": docs,
    }

@router.post("/reindex")
async def reindex_knowledge_base():
    rag_service.index_knowledge_base()
    return {
        "success": True,
        "message": "Knowledge base successfully reindexed with authoritative precedence hierarchy.",
        "stats": rag_service.get_stats(),
    }
