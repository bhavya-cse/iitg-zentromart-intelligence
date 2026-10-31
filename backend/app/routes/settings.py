import os
from pathlib import Path
from fastapi import APIRouter
from app.config import (
    GNANI_API_KEY,
    GEMINI_API_KEY,
    GNANI_TTS_MODEL,
    REFERENCE_DATE,
    DATASET_PATH,
    BASE_DIR,
)
from app.models.schemas import SettingsUpdateRequest
from app.services.voice_service import voice_service

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
async def get_settings():
    gnani_key = os.getenv("GNANI_API_KEY", GNANI_API_KEY)
    gemini_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)

    return {
        "gnani_api_key_masked": bool(gnani_key),
        "gemini_api_key_masked": bool(gemini_key),
        "gnani_tts_model": os.getenv("GNANI_TTS_MODEL", GNANI_TTS_MODEL),
        "reference_date": REFERENCE_DATE,
        "dataset_path": str(DATASET_PATH.relative_to(BASE_DIR)) if DATASET_PATH.is_relative_to(BASE_DIR) else str(DATASET_PATH),
        "temperature": 0.1,
    }

@router.post("")
async def update_settings(req: SettingsUpdateRequest):
    env_file = BASE_DIR / ".env"
    lines = []
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            lines = f.readlines()

    def set_env_var(key: str, val: str):
        nonlocal lines
        found = False
        new_lines = []
        for line in lines:
            if line.startswith(f"{key}="):
                new_lines.append(f"{key}={val}\n")
                found = True
            else:
                new_lines.append(line)
        if not found:
            new_lines.append(f"{key}={val}\n")
        lines = new_lines
        os.environ[key] = val

    if req.gnani_api_key and req.gnani_api_key.strip():
        set_env_var("GNANI_API_KEY", req.gnani_api_key.strip())
        voice_service.api_key = req.gnani_api_key.strip()
        voice_service._init_clients()

    if req.gemini_api_key and req.gemini_api_key.strip():
        set_env_var("GEMINI_API_KEY", req.gemini_api_key.strip())

    if req.gnani_tts_model:
        set_env_var("GNANI_TTS_MODEL", req.gnani_tts_model.strip())
        voice_service.model = req.gnani_tts_model.strip()

    if req.dataset_path:
        set_env_var("DATASET_DIR_NAME", req.dataset_path.strip())

    try:
        with open(env_file, "w", encoding="utf-8") as f:
            f.writelines(lines)
    except Exception as e:
        pass

    return {"success": True, "message": "Settings updated successfully."}
