import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend directory
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Capstone Configuration
DATASET_DIR_NAME = os.getenv("DATASET_DIR_NAME", "Capstone_Project_Dataset_FTTT_2026")
DATASET_PATH = BASE_DIR / DATASET_DIR_NAME

# VoiceOps Reference Date (Fixed per capstone specification)
REFERENCE_DATE = os.getenv("REFERENCE_DATE", "2026-10-20")

# API Keys
GNANI_API_KEY = os.getenv("GNANI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Gnani Settings
GNANI_TTS_MODEL = os.getenv("GNANI_TTS_MODEL", "timbre-v2.5")

# Audio Storage Directory for Voice Responses
AUDIO_DIR = BASE_DIR / "backend" / "app" / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Data Storage for User Sessions & Tickets
STORAGE_DIR = BASE_DIR / "backend" / "app" / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
