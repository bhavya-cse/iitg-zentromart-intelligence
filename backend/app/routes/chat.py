from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import llm_service

router = APIRouter(prefix="/chat", tags=["AI Support"])

@router.post("", response_model=ChatResponse)
async def process_chat_message(req: ChatRequest):
    try:
        context_dicts = [{"role": m.role, "content": m.content} for m in req.context] if req.context else []
        res = await llm_service.generate_response(
            message=req.message,
            context=context_dicts,
            session_id=req.session_id,
            customer_id=req.customer_id,
        )
        return ChatResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_chat_history():
    sessions = []
    for s_id, msgs in llm_service.active_sessions.items():
        first_user = next((m["content"] for m in msgs if m["role"] == "user"), "Support Session")
        sessions.append({
            "session_id": s_id,
            "title": first_user[:40],
            "message_count": len(msgs),
        })
    return {"sessions": sessions}

@router.delete("/history")
async def clear_chat_history():
    llm_service.active_sessions.clear()
    return {"cleared": True}
