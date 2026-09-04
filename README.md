# FinSheild App — Real-Time Fraud Command Center & Investigation Copilot

The web dashboard and investigation workstation for the **FinSheild** fraud intelligence platform. Built during the hackathon to provide fraud analysts and risk teams with real-time decisioning, deep-dive forensic explanations, and interactive graph forensics.

---

## Architecture

```
Finsheild-App/
├── backend/                  # FastAPI REST Service & Adapter Layer
│   ├── adapters/
│   │   ├── real_adapter.py   # Seam connecting to FinSheild ML pipeline
│   │   └── mock_adapter.py   # Deterministic fallback simulation
│   ├── services/store.py     # In-memory transaction & graph store
│   ├── main.py               # REST API endpoints
│   ├── metrics_loader.py     # Real benchmark metrics ingestion
│   └── schemas.py            # Shared Pydantic schemas
├── frontend/                 # React 19 + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── pages.tsx         # Dashboard, Investigation, Performance, Architecture, Privacy
│   │   ├── api.ts            # API client
│   │   └── App.tsx           # Routing and shell
│   └── package.json
└── start.sh                  # One-click demo launcher
```

---

## Features

1. **Live Command Center**: Real-time incoming transaction stream with scenario triggers (Normal, Account Takeover, Velocity Abuse, Device Sharing).
2. **5-Signal Risk Breakdown**: Displays real-time contributions from XGBoost, Isolation Forest anomaly scoring, Behavioral profiling, Graph analytics, and Deterministic rules.
3. **Forensic Investigation**: Deep-dive transaction view with SHAP feature attribution and LLM-assisted investigation summaries.
4. **Graph Forensics**: Visualizes entity link relationships (User ↔ Account ↔ Device ↔ Merchant) to expose mule rings and device-sharing syndicates.
5. **Model Performance Observatory**: Live metrics ingestion displaying PR-AUC, ROC-AUC, and confusion matrix from the core benchmark.

---

## Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.11

### Run with One Command
```bash
./start.sh
```
This automatically starts:
- **FastAPI Backend**: `http://127.0.0.1:8000` (Swagger docs at `/docs`)
- **Vite React Frontend**: `http://127.0.0.1:5173`

### Running Individually

**Backend**:
```bash
pip install -r requirements.txt
export PYTHONPATH=.
python -m uvicorn backend.main:app --port 8000 --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## Integration with FinSheild ML Core

`Finsheild-App` automatically detects the sibling ML Core repository at `../Finsheild`. You can also explicitly specify its location:
```bash
export FINSHEILD_CORE_PATH=/path/to/Finsheild
```

If the ML Core artifacts or packages are not present, the app gracefully falls back to deterministic simulation mode with honest `DEMO_FALLBACK` labeling in the UI.
