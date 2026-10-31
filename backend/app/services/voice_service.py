import os
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from gnani.stt import GnaniSTTClient
from gnani.tts import GnaniTTSClient

from app.config import GNANI_API_KEY, GNANI_TTS_MODEL, AUDIO_DIR
from app.services.llm_service import llm_service

logger = logging.getLogger("VoiceService")

# Supported 10 Indian Languages & Code Mappings
LANG_CODE_MAP = {
    "hi": "hi-IN",
    "en": "en-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
    "pa": "pa-IN",
    "ta": "ta-IN",
    "te": "te-IN",
}

DEFAULT_VOICES = {
    "hi": "Roopesh",
    "en": "Lehara",
    "bn": "Bhavna",
    "gu": "Roopesh",
    "kn": "Lavanya",
    "ml": "Lavanya",
    "mr": "Omkar",
    "pa": "Roopesh",
    "ta": "Lavanya",
    "te": "Lavanya",
}

class VoiceService:
    def __init__(self):
        self.api_key = GNANI_API_KEY
        self.model = GNANI_TTS_MODEL
        self.stt_client: Optional[GnaniSTTClient] = None
        self.tts_client: Optional[GnaniTTSClient] = None
        self._init_clients()

    def _init_clients(self):
        self.api_key = os.getenv("GNANI_API_KEY", self.api_key)
        if self.api_key and self.api_key.strip():
            try:
                self.stt_client = GnaniSTTClient(api_key=self.api_key)
                self.tts_client = GnaniTTSClient(api_key=self.api_key)
                logger.info("Gnani STT and TTS clients initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Gnani clients: {e}")
                self.stt_client = None
                self.tts_client = None
        else:
            self.stt_client = None
            self.tts_client = None

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self.tts_client is not None)

    async def transcribe_audio(self, audio_bytes: bytes, language: str = "hi") -> str:
        """Transcribes incoming audio file using GnaniSTTClient."""
        if not self.is_configured():
            raise ValueError(
                "GNANI_API_KEY is missing. Configure your Gnani.ai credentials in Settings or .env to enable Speech-to-Text."
            )

        lang_code = LANG_CODE_MAP.get(language.lower(), "hi-IN")
        
        # Save temp file for transcribe
        temp_id = uuid.uuid4().hex
        temp_path = AUDIO_DIR / f"temp_{temp_id}.webm"
        with open(temp_path, "wb") as f:
            f.write(audio_bytes)

        try:
            res = self.stt_client.transcribe(str(temp_path), language_code=lang_code)
            transcript = res.get("transcript") or res.get("text", "")
            return transcript.strip()
        finally:
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception:
                    pass

    async def synthesize_speech(self, text: str, language: str = "hi") -> Optional[str]:
        """Synthesizes response text into playable speech audio using GnaniTTSClient."""
        if not self.is_configured():
            logger.warning("Gnani key missing: Audio speech synthesis not executed (simulation prohibited).")
            return None

        lang = language.lower()
        voice = DEFAULT_VOICES.get(lang, "Roopesh")

        try:
            audio_bytes = self.tts_client.synthesize(
                text=text,
                voice=voice,
                model=self.model,
                language=lang,
            )

            file_id = f"speech_{uuid.uuid4().hex[:12]}.wav"
            out_path = AUDIO_DIR / file_id
            with open(out_path, "wb") as f:
                f.write(audio_bytes)

            return f"/api/voice/audio/{file_id}"
        except Exception as e:
            logger.error(f"Gnani TTS synthesis error: {e}")
            raise e

    async def run_voice_pipeline(
        self,
        audio_bytes: Optional[bytes] = None,
        text_override: Optional[str] = None,
        language: str = "hi",
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Executes the official VoiceOps 2026 pipeline:
        Customer speaks → Gnani STT → Transcript → AI support agent (LLM + RAG + context + tools) → Gnani TTS → Playable spoken response.
        """
        transcript = ""
        if audio_bytes and len(audio_bytes) > 0:
            transcript = await self.transcribe_audio(audio_bytes, language=language)
        elif text_override:
            transcript = text_override.strip()
        else:
            raise ValueError("No audio data or text provided for voice pipeline.")

        # Pass through the exact same conversational intelligence engine
        llm_res = await llm_service.generate_response(
            message=transcript,
            session_id=session_id,
        )

        response_text = llm_res["reply"]
        sources = llm_res.get("sources", [])

        # Synthesize speech
        audio_url = None
        if self.is_configured():
            audio_url = await self.synthesize_speech(response_text, language=language)

        return {
            "success": True,
            "language": language,
            "transcript": transcript,
            "response_text": response_text,
            "audio_url": audio_url,
            "sources": sources,
            "tool_calls": llm_res.get("tool_calls", []),
            "escalated": llm_res.get("escalated", False),
        }

voice_service = VoiceService()
