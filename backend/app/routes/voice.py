from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse

from app.config import AUDIO_DIR, GNANI_TTS_MODEL
from app.models.schemas import VoiceProcessResponse, SpeechSynthesisRequest
from app.services.voice_service import voice_service, LANG_CODE_MAP

router = APIRouter(prefix="/voice", tags=["Voice Studio"])

@router.post("/process", response_model=VoiceProcessResponse)
async def process_voice_turn(
    audio: Optional[UploadFile] = File(None),
    text_input: Optional[str] = Form(None),
    language: str = Form("hi"),
    session_id: Optional[str] = Form(None),
):
    # Normalize language codes to the short codes expected by VoiceService.
    language_input = language.strip().lower()

    if language_input == "auto":
        language = "auto"
    else:
        language = next(
            (
                short_code
                for short_code, regional_code in LANG_CODE_MAP.items()
                if language_input in (short_code, regional_code.lower())
            ),
            None,
        )

        if language is None:
            raise HTTPException(
                status_code=400,
                detail="Unsupported language. Choose from: auto, "
                       + ", ".join(LANG_CODE_MAP.keys()),
            )
    audio_bytes = None
    if audio:
        audio_bytes = await audio.read()
    try:
        res = await voice_service.run_voice_pipeline(
            audio_bytes=audio_bytes,
            text_override=text_input,
            language=language,
            session_id=session_id,
        )
        return VoiceProcessResponse(**res)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/synthesize")
async def direct_tts_synthesis(req: SpeechSynthesisRequest):
    if not voice_service.is_configured():
        raise HTTPException(
            status_code=400,
            detail="GNANI_API_KEY required. Please configure your key in Settings to synthesize speech audio.",
        )
    try:
        url = await voice_service.synthesize_speech(req.text, language=req.language)
        return {"audio_url": url, "text": req.text, "language": req.language}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audio/{filename}")
async def serve_audio_file(filename: str):
    file_path = AUDIO_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found.")
    return FileResponse(file_path, media_type="audio/wav")

@router.get("/settings")
async def get_voice_settings():
    return {
        "is_configured": voice_service.is_configured(),
        "tts_model": GNANI_TTS_MODEL,
        "supported_languages": list(LANG_CODE_MAP.keys()),
        "sdk": "gnani-vachana (GnaniSTTClient, GnaniTTSClient)",
    }
