import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import AUDIO_DIR, BASE_DIR
from app.routes import (
    health,
    overview,
    chat,
    voice,
    orders,
    tickets,
    knowledge_base,
    analytics,
    evaluation,
    settings,
)

# Configure structured enterprise logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ZentroMartApp")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ZentroMart Intelligence Platform...")
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    yield
    logger.info("Shutting down ZentroMart Intelligence Platform.")

app = FastAPI(
    title="ZentroMart Intelligence API",
    description="Enterprise AI Customer Support Platform for VoiceOps 2026",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware allowing local frontend Vite dev server (5173/5174/3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Modular Routes under /api
app.include_router(health.router, prefix="/api")
app.include_router(overview.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(knowledge_base.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(evaluation.router, prefix="/api")
app.include_router(settings.router, prefix="/api")

# Static mount for generated voice audio files
app.mount("/static/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")

@app.get("/")
async def root():
    return {
        "product": "ZentroMart Intelligence",
        "tagline": "An intelligent customer support experience.",
        "version": "2026.1",
        "status": "operational",
        "endpoints": {
            "health": "/api/health",
            "overview": "/api/overview",
            "chat": "/api/chat",
            "voice": "/api/voice/process",
            "orders": "/api/orders",
            "tickets": "/api/tickets",
            "knowledge_base": "/api/knowledge-base",
            "analytics": "/api/analytics",
            "evaluation": "/api/evaluation",
            "settings": "/api/settings",
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
