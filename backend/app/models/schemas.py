from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Health Schemas ---
class HealthResponse(BaseModel):
    status: str
    all_healthy: bool
    llm_available: bool
    rag_ready: bool
    gnani_configured: bool
    gnani_stt: bool
    gnani_tts: bool
    dataset_present: bool
    dataset_validation: Dict[str, Any]
    reference_date: str

# --- Chat Schemas ---
class ChatContextMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[List[ChatContextMessage]] = []
    session_id: Optional[str] = None
    customer_id: Optional[str] = None

class EvidenceSource(BaseModel):
    doc_id: str
    doc_name: str
    title: Optional[str] = None
    section_id: Optional[str] = None
    category: Optional[str] = None
    relevance_score: Optional[float] = None
    text: str
    effective_date: Optional[str] = None
    is_active_policy: Optional[bool] = True
    precedence_note: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    sources: List[EvidenceSource] = []
    session_id: str
    escalated: bool = False
    order_info: Optional[Dict[str, Any]] = None
    ticket_info: Optional[Dict[str, Any]] = None
    tool_calls: List[Dict[str, Any]] = []

# --- Voice Schemas ---
class VoiceProcessResponse(BaseModel):
    success: bool
    language: str
    transcript: str
    response_text: str
    audio_url: Optional[str] = None
    sources: List[EvidenceSource] = []
    error: Optional[str] = None

class SpeechSynthesisRequest(BaseModel):
    text: str
    language: str = "hi"
    model: str = "timbre-v2.5"

# --- Order Schemas ---
class OrderLookupRequest(BaseModel):
    order_id: str
    verification_credential: Optional[str] = None

class OrderLookupResponse(BaseModel):
    verified: bool
    order_id: str
    reason: Optional[str] = None
    order_details: Optional[Dict[str, Any]] = None

# --- Ticket Schemas ---
class TicketCreateRequest(BaseModel):
    summary: str
    customer_id: Optional[str] = None
    order_id: Optional[str] = None
    escalation_reason: Optional[str] = "Policy requires human intervention"

class TicketCreateResponse(BaseModel):
    created: bool
    ticket_id: str
    summary: str
    message: str
    timestamp: str

# --- Settings Schemas ---
class SettingsUpdateRequest(BaseModel):
    gnani_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    gnani_tts_model: Optional[str] = None
    reference_date: Optional[str] = None
    dataset_path: Optional[str] = None
    temperature: Optional[float] = None
