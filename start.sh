#!/usr/bin/env bash

# ==============================================================================
# ZentroMart Intelligence — One-Command Startup Script (macOS)
# Starts FastAPI backend (port 8000) and Vite React frontend (port 5173)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo ""
echo "============================================================"
echo "   ZENTROMART INTELLIGENCE — AI Customer Support Platform   "
echo "   VoiceOps 2026 Capstone Production Architecture           "
echo "============================================================"
echo ""

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo "[-] Python 3 not found. Please install Python 3.10+."
    exit 1
fi

# 2. Check Virtual Environment
if [ ! -d "backend/.venv" ]; then
    echo "[+] Creating Python virtual environment in backend/.venv..."
    python3 -m venv backend/.venv
    backend/.venv/bin/pip install --upgrade pip
    backend/.venv/bin/pip install -r backend/requirements.txt
fi

# 3. Check Node.js and Frontend
if ! command -v node &> /dev/null; then
    echo "[-] Node.js not found. Please install Node.js 18+."
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "[+] Installing frontend dependencies..."
    (cd frontend && npm install)
fi

# 4. Start Backend Service
echo "[+] Starting FastAPI backend on http://127.0.0.1:8001 ..."
PYTHONPATH=backend backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001 &
BACKEND_PID=$!

# 5. Start Frontend Service
echo "[+] Starting Vite React frontend on http://127.0.0.1:5175 ..."
(cd frontend && npm run dev -- --host 127.0.0.1 --port 5175) &
FRONTEND_PID=$!

# Cleanup on exit
cleanup() {
    echo ""
    echo "[*] Shutting down ZentroMart Intelligence services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "[✓] All processes stopped cleanly."
    exit 0
}

trap cleanup INT TERM

echo ""
echo "============================================================"
echo " [✓] ZentroMart Intelligence is running!"
echo "     • Frontend: http://localhost:5175"
echo "     • Backend API: http://127.0.0.1:8001"
echo "     • API Docs: http://127.0.0.1:8001/docs"
echo "============================================================"
echo " Press Ctrl+C to terminate both servers."
echo ""

# Wait for children
wait
