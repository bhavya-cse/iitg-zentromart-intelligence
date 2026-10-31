# ZentroMart Intelligence

> **An intelligent customer support experience.**  
> *Production-Grade AI Support Platform for VoiceOps 2026 Capstone.*

---

## 1. Visual Identity & Design Philosophy

ZentroMart Intelligence is built with the **Pratyora** design language, bringing sophisticated typography, human-designed layouts, and a deep-indigo visual identity suited for an Indian enterprise technology product:

- **Primary Indigo:** `#17143F`
- **Secondary Indigo:** `#29245B`
- **Deep Background:** `#100E2D`
- **Light Background:** `#F7F6FB`
- **Surface White:** `#FFFFFF`
- **Primary Accent:** `#723ECF`
- **Soft Violet:** `#EDE7FA`
- **Success:** `#21865B`
- **Warning:** `#D69A35`
- **Error:** `#C94C59`
- **Body Text:** `#29283A`
- **Muted Text:** `#77758A`

### Typography Hierarchy
- **Prominent Headings:** `Bricolage Grotesque`
- **Body & Interface Elements:** `Figtree`
- **Indian-Language Transcriptions:** `Tiro Devanagari Hindi` / `Tiro Devanagari Sanskrit`
- **Monospace Telemetry:** `JetBrains Mono`

---

## 2. Core Functional Modules

The platform features 8 dedicated modules accessible via the collapsible sidebar and top navigation:

| # | Module | Capabilities |
|---|--------|--------------|
| **1** | **Overview** | Executive dashboard displaying total conversations, automated resolution rate, human escalations, average latency, live AI service health (LLM, RAG, Gnani STT/TTS), and conversational activity breakdown. |
| **2** | **AI Support** | Conversational support assistant grounded in corporate policy documents with multi-turn memory, one-question-at-a-time pacing, expandable policy evidence drawers, copy/regenerate controls, and deterministic tool execution. |
| **3** | **Voice Studio** | Multilingual voice console with real-time waveform visualization, recording timer, and official **Gnani.ai** STT & TTS clients (`gnani-vachana`) across 10 Indian languages. |
| **4** | **Knowledge Base** | Document and chunk management repository enforcing strict policy precedence: `Current policies (pol_returns_v4.md)` strictly override `pol_returns_v3_superseded.md`. Historical support logs are treated as operational data, never authoritative policy. |
| **5** | **Orders** | Full order management with destination pincodes, promised delivery dates, and return window evaluations. **Customer verification is strictly enforced before revealing private order details.** |
| **6** | **Support Tickets** | Auditable human escalation management. Integrated with `create_ticket(summary)` tool; confirms ticket creation only after backend registers `created=True`. |
| **7** | **Analytics** | Comprehensive performance metrics, RAG retrieval precision, and empirical **Step 1 (Prompt-Only) vs Step 2 (RAG-Enhanced)** benchmark comparisons. |
| **8** | **Settings** | Secure credentials vault for `GNANI_API_KEY`, `GEMINI_API_KEY`, TTS models (`timbre-v2.5` / `timbre-v3.0`), and dataset path configurations. |

---

## 3. Official Voice Engine: Gnani.ai Integration

The voice studio integrates exclusively with **Gnani.ai** using the official Python SDK `gnani-vachana`:
- **Speech-to-Text:** `gnani.stt.GnaniSTTClient`
- **Text-to-Speech:** `gnani.tts.GnaniTTSClient`
- **TTS Models Supported:** `timbre-v2.5` (Standard Production), `timbre-v3.0` (High-Fidelity)

### Supported Indian Languages (10 Languages)
- Hindi (`hi`)
- English (`en`)
- Bengali (`bn`)
- Gujarati (`gu`)
- Kannada (`kn`)
- Malayalam (`ml`)
- Marathi (`mr`)
- Punjabi (`pa`)
- Tamil (`ta`)
- Telugu (`te`)

*In accordance with platform guidelines, fake audio responses are never simulated. If `GNANI_API_KEY` is not present, an intuitive connection-required guide is shown.*

---

## 4. Capstone Dataset & Reference Date Specification

- **System Reference Date:** `20 October 2026`
- **Calendar Rules:**
  - **Return Windows:** Strict **calendar days** from delivery date (e.g. 7 calendar days for electronics under `pol_returns_v4.md`).
  - **Logistics & Dispatch:** **Business days** run Monday to Saturday, excluding official gazetted holidays.
- **Dataset Path:** `Capstone_Project_Dataset_FTTT_2026/`
  - Expected Files: `customers.csv` (300 rows), `orders.csv` (1,000 rows), `order_items.csv` (1,783 rows), `products.csv` (70 rows), `pincodes.csv` (36 rows), `holidays.csv` (4 rows), `support_logs.csv` (244 rows).
  - Practice Set: 52 questions, 23 conversations, 96 customer turns.
  - Ingestion Rule: Pandas loaded with `dtype=str` to preserve all leading zeros and IDs as strings.

---

## 5. Quickstart & Execution (macOS)

### One-Command Startup
Run the unified launch script from the repository root:
```bash
./start.sh
```

This will automatically:
1. Initialize the Python virtual environment in `backend/.venv` (if needed).
2. Install dependencies (`fastapi`, `uvicorn`, `pandas`, `gnani-vachana`, etc.).
3. Start the FastAPI backend on **`http://127.0.0.1:8001`**.
4. Start the Vite React frontend on **`http://127.0.0.1:5175`**.

### Manual Execution

#### Terminal 1 — Backend:
```bash
source backend/.venv/bin/activate
PYTHONPATH=backend uvicorn app.main:app --host 127.0.0.1 --port 8001
```

#### Terminal 2 — Frontend:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5175
```

Open your browser to: **`http://localhost:5175`**

---

## 6. Automated Testing

Run the automated test suite covering order lookup verification gates, RAG precedence hierarchies, ticket creation tools, and API endpoints:
```bash
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests
```

**Results:**
- `test_api.py`: 7 passed
- `test_orders.py`: 3 passed
- `test_rag.py`: 3 passed
- `test_tickets.py`: 2 passed
- `test_voice.py`: 2 passed
- **Total: 17 passed (100% pass rate)**

---

## 7. Security & Privacy Assurance

- API keys (`GNANI_API_KEY`, `GEMINI_API_KEY`) are stored in `.env` on the server and are **never exposed to frontend client code**.
- Order itemization, return eligibility, and delivery addresses are masked behind verification gates until the customer verifies their identity.
