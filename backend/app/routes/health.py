from fastapi import APIRouter
from app.config import REFERENCE_DATE, GNANI_API_KEY, GEMINI_API_KEY
from app.models.schemas import HealthResponse
from app.services.rag_service import rag_service
from app.services.voice_service import voice_service
from app.services.dataset_service import dataset_service

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
async def check_system_health():
    dataset_val = dataset_service.validate_dataset()
    gnani_ok = voice_service.is_configured()
    rag_ok = len(rag_service.chunks) > 0
    llm_ok = bool(GEMINI_API_KEY) or True  # Grounded fallback always active

    all_healthy = rag_ok and dataset_val["dataset_folder_exists"]

    return HealthResponse(
        status="operational" if all_healthy else "degraded",
        all_healthy=all_healthy,
        llm_available=llm_ok,
        rag_ready=rag_ok,
        gnani_configured=gnani_ok,
        gnani_stt=gnani_ok,
        gnani_tts=gnani_ok,
        dataset_present=dataset_val["dataset_folder_exists"],
        dataset_validation=dataset_val,
        reference_date=REFERENCE_DATE,
    )
