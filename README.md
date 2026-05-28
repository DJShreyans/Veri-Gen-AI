# VeriGen AI

The GitHub Copilot for Hardware Engineers.

VeriGen AI is a hardware-native AI engineering workspace for RTL debugging,
testbench generation, waveform reasoning, and Codex-assisted RTL repair.

## MVP Scope

- RTL debugger for pasted Verilog/SystemVerilog snippets
- Testbench generator with clock, reset, stimulus, monitors, and edge cases
- Waveform screenshot analyzer using OpenAI vision
- Visible Codex Fix Mode for rewriting and improving RTL
- FastAPI backend with optional Icarus Verilog validation
- Next.js workspace with Monaco editor and three-panel engineering UI

## Repository Layout

```text
verigen-ai/
  apps/
    web/                         # Next.js 14 frontend
      src/
        app/
          (marketing)/            # Startup-grade homepage
          workspace/              # Core RTL engineering workspace
          api/                    # Optional Next route handlers/proxies
        components/
          assistant/              # Chat and AI interaction components
          editor/                 # Monaco RTL editor components
          layout/                 # Shell, panels, navigation
          outputs/                # Analysis/result renderers
          upload/                 # Waveform upload UI
          ui/                     # shadcn/ui components
        hooks/                    # React hooks
        lib/                      # API client, utilities, constants
        stores/                   # Zustand stores
        types/                    # Frontend TypeScript types
      public/                     # Static assets
      tests/                      # Frontend tests
    api/                         # FastAPI backend
      app/
        api/
          routes/                 # /debug-rtl, /generate-testbench, etc.
        core/                     # Settings, logging, error handling
        models/                   # Pydantic request/response schemas
        services/
          ai/                     # OpenAI Responses API integration
          codex/                  # Codex Fix Mode orchestration
          hardware/               # Icarus Verilog validation utilities
          waveform/               # Vision and image preprocessing
        prompts/                  # Hardware-specialized system prompts
        utils/                    # Shared backend helpers
      tests/                      # Backend tests
  packages/
    shared/                       # Shared contracts/types if needed
  docs/
    architecture.md               # Product and technical architecture
    roadmap.md                    # 7-day implementation plan
    api-contract.md               # Backend endpoint contracts
  infra/                          # Deployment config
  scripts/                        # Local developer scripts
```

## Local Development Target

- Frontend: `apps/web`, served on `http://localhost:3000`
- Backend: `apps/api`, served on `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## Quick Start

```bash
cp .env.example .env
```

Backend:

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

The app runs in demo mode when `OPENAI_API_KEY` is empty. Add an API key to
enable the OpenAI-powered RTL, Codex, and waveform workflows.

## Hackathon Cut Line

This MVP intentionally includes only:

- RTL Debugger
- Testbench Generator
- Waveform Analyzer
- Fix with Codex

It intentionally excludes authentication, payments, dashboards, databases,
VHDL support, and other nonessential product surface area.

See [docs/architecture.md](docs/architecture.md), [docs/roadmap.md](docs/roadmap.md),
and [docs/api-contract.md](docs/api-contract.md) for the initial implementation plan.
The complete hackathon-optimized folder map is in
[docs/project-architecture.md](docs/project-architecture.md).
