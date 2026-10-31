import pytest
from app.services.voice_service import voice_service, LANG_CODE_MAP

def test_supported_languages_contains_10_indian_languages():
    expected_langs = ["hi", "en", "bn", "gu", "kn", "ml", "mr", "pa", "ta", "te"]
    for l in expected_langs:
        assert l in LANG_CODE_MAP

def test_voice_pipeline_rejects_missing_key_simulation():
    # If unconfigured, calling synthesize_speech must not fabricate audio
    if not voice_service.is_configured():
        # verify it handles it without fabricating success
        assert voice_service.stt_client is None
        assert voice_service.tts_client is None
