# ZentroMart Intelligence

### Intelligence that listens. Support that understands.

An AI-powered, multilingual customer-support platform combining large language models, retrieval-augmented generation (RAG), voice processing, order intelligence, and automated support workflows.

[![Python](https://img.shields.io/badge/Python-3.14-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)](https://vite.dev/)
[![AI](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google)](https://ai.google.dev/)

---

## Overview

ZentroMart Intelligence is a customer-support platform built around a fictional Indian retail company, ZentroMart.

It aims to make customer support more context-aware and efficient by combining conversational AI with company knowledge, order information, customer verification, and voice interaction.

Instead of relying entirely on generic chatbot responses, the platform uses retrieved knowledge and application services to support more grounded customer interactions.

## Key Features

### AI-powered customer support
- Conversational support powered by Gemini.
- Context-aware responses using retrieved knowledge.
- Multi-turn conversation handling.
- Support for customer queries across common retail scenarios.

### Retrieval-Augmented Generation (RAG)
- Knowledge-base document ingestion and indexing.
- Document categorisation and relevance ranking.
- Retrieval of relevant policy and help-document sections.
- Handling of current and superseded policy information.
- Evidence-oriented responses to improve answer grounding.

### Multilingual voice processing
- Voice input and speech processing through Gnani.ai integration.
- Text-to-speech support.
- Language selection and language-code normalisation.
- Voice interaction through the Voice Studio interface.

*Actual speech functionality depends on valid provider credentials and service availability.*

### Order intelligence
- Order and product information retrieval.
- Customer verification before protected order information is disclosed.
- Product, delivery, payment, and return-related information.
- Support for order-related customer queries.

### Support ticket management
- Automated support-ticket creation.
- Ticket status and resolution tracking.
- Escalation workflows.
- Support-ticket management through the dashboard.

### Analytics and administration
- Operational overview.
- Analytics dashboard.
- Knowledge-base management.
- Order management.
- Support-ticket management.
- Application settings.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| AI / LLM | Google Gemini |
| Knowledge retrieval | Custom RAG pipeline |
| Voice services | Gnani.ai STT / TTS integration |
| Data processing | Python, CSV, JSON |
| Testing | Pytest |
| Version control | Git, GitHub |

---

## System Architecture

```text
                 CUSTOMER
                     |
                     v
             REACT FRONTEND
                     |
                     v
              FASTAPI BACKEND
                     |
          +----------+----------+
          |          |          |
          v          v          v
       AI CHAT      RAG      VOICE
          |       PIPELINE   SERVICES
          |          |          |
          v          v          v
       GEMINI    KNOWLEDGE    GNANI.AI
          |       BASE       STT / TTS
          |          |
          +----------+
                     |
          +----------+----------+
          |                     |
          v                     v
     ORDER SERVICES       TICKET SERVICES
          |                     |
          v                     v
     CUSTOMER DATA        TICKET STORAGE
                     |
                     v
              API RESPONSE
                     |
                     v
              REACT FRONTEND
```

---

## Project Structure

```text
zentromart.intelligence/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   │
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── overview.py
│   │   │   ├── chat.py
│   │   │   ├── voice.py
│   │   │   ├── orders.py
│   │   │   ├── tickets.py
│   │   │   ├── knowledge_base.py
│   │   │   ├── analytics.py
│   │   │   ├── evaluation.py
│   │   │   └── settings.py
│   │   │
│   │   ├── services/
│   │   │   ├── dataset_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── order_service.py
│   │   │   ├── ticket_service.py
│   │   │   ├── voice_service.py
│   │   │   └── eval_service.py
│   │   │
│   │   └── storage/
│   │       └── tickets.json
│   │
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── Capstone_Project_Dataset_FTTT_2026/
├── generate_synthetic_dataset.py
├── SYNTHETIC_DATA_NOTICE.txt
├── start.sh
├── pytest.ini
└── README.md
```

---

## Getting Started

### Prerequisites

Install the following before running the application:

- Python 3.14 or a compatible Python version.
- Node.js and npm.
- Git.
- API credentials for the external AI and voice services you intend to use.

### 1. Clone the repository

```bash
git clone https://github.com/bhavya-cse/iitg-zentromart-intelligence.git

cd iitg-zentromart-intelligence
```

### 2. Configure the backend

```bash
cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt
```

Configure the required environment variables using the names expected by `backend/app/config.py` and the relevant service modules.

Keep API credentials in environment files. Never commit secrets to GitHub.

### 3. Start the backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8001
```

The backend should be available at:

- API: `http://127.0.0.1:8001`
- Interactive API documentation: `http://127.0.0.1:8001/docs`

### 4. Start the frontend

Open another Terminal window:

```bash
cd ~/Downloads/zentromart.intelligence/frontend

npm install

npm run dev
```

Open the local URL printed by Vite in your terminal.

---

## API Modules

The backend exposes modular API routes under the `/api` prefix.

| Module | Route |
|---|---|
| Health | `/api/health` |
| Overview | `/api/overview` |
| AI chat | `/api/chat` |
| Voice processing | `/api/voice` |
| Orders | `/api/orders` |
| Tickets | `/api/tickets` |
| Knowledge base | `/api/knowledge-base` |
| Analytics | `/api/analytics` |
| Evaluation | `/api/evaluation` |
| Settings | `/api/settings` |

For request schemas, parameters, and available operations, use the interactive FastAPI documentation at `/docs`.

---

## Testing

Run the backend test suite from the `backend` directory:

```bash
source .venv/bin/activate

pytest -q
```

To check Python syntax for the backend modules:

```bash
python -m compileall -q app
```

Tests should be rerun after code changes. External API tests may require valid credentials and network access.

---

## Data and Privacy

ZentroMart is a fictional retail company used for project development and demonstration.

- Do not use the application as a real customer-support system.
- Do not enter real customer credentials or sensitive personal information.
- Protect API keys and local environment files.
- Order verification and ticket workflows should be treated as demonstration functionality unless separately hardened and integrated with production identity and storage systems.

**Dataset notice:** Any generated synthetic dataset is for local development and demonstration only. It must not be represented as the official VoiceOps capstone dataset or used as a substitute for organiser-provided evaluation data.

---

## Current Scope and Limitations

This repository represents an actively developed project.

The following should be verified in the target environment before production use:

- External Gemini and Gnani.ai connectivity.
- Accuracy and grounding of AI-generated responses.
- Customer identity verification against approved data fields.
- Ticket persistence and reliability.
- Voice recognition and synthesis across supported languages.
- Security, authentication, authorisation, and deployment configuration.
- Performance under concurrent requests.

A dashboard status indicator alone should not be interpreted as proof that an external integration is operational.

---

## Future Improvements

- Stronger authentication and role-based access control.
- Persistent database-backed conversations and tickets.
- Improved retrieval and answer-quality evaluation.
- Expanded multilingual test coverage.
- Production-grade monitoring and structured logging.
- More comprehensive API and frontend tests.
- Secure deployment and operational hardening.

---

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Run the relevant tests.
5. Submit a pull request with a clear description.

---

## Acknowledgements

This project is developed in the context of the VoiceOps 2026 capstone challenge.

The project is an independent implementation and is not an official product or endorsement of IIT Guwahati, the Consulting & Analytics Club, or Gnani.ai.

---

## Author

**Bhavya**

GitHub: [@bhavya-cse](https://github.com/bhavya-cse)

---

<p align="center">
  <strong>ZentroMart Intelligence</strong><br/>
  Intelligence that listens. Support that understands.
</p>
