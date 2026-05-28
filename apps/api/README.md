# VeriGen AI API

FastAPI backend for the VeriGen AI MVP.

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `POST /debug-rtl`
- `POST /generate-testbench`
- `POST /analyze-waveform`
- `POST /codex-fix`

If `OPENAI_API_KEY` is not set, endpoints return deterministic demo-mode
responses so the hackathon flow still works locally.

## OpenAI Integration

Reusable OpenAI calls live in `app/services/ai/openai_service.py`:

- Responses API for RTL debugging and testbench generation
- Codex Fix Mode for RTL repair
- Vision-capable Responses API calls for waveform screenshots

