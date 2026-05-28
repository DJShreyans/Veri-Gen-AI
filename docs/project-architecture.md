# VeriGen AI Project Architecture

VeriGen AI is optimized for a 7-day hackathon MVP. The architecture keeps the
four required workflows isolated, typed, and demoable without adding auth,
payments, dashboards, databases, or VHDL support.

## High-Level Flow

```text
Next.js 14 Workspace
  -> typed API client
  -> FastAPI routes
  -> workflow service
  -> OpenAI Responses API / Vision / Codex mode
  -> optional Icarus Verilog validation
  -> structured response rendered in the UI
```

## Folder Structure

```text
verigen-ai/
  README.md
  package.json
  package-lock.json
  .env.example
  .gitignore

  apps/
    web/
      README.md
      package.json
      next.config.mjs
      tailwind.config.ts
      postcss.config.js
      tsconfig.json
      .env.example

      public/

      src/
        app/
          layout.tsx
          page.tsx                         # Landing page
          globals.css
          workspace/
            page.tsx                       # Main engineering workspace
          api/                             # Reserved for optional Next proxies

        components/
          assistant/
            assistant-panel.tsx            # Left contextual AI panel
          editor/
            rtl-editor.tsx                 # Monaco RTL editor
          layout/
            action-bar.tsx                 # Workflow buttons + waveform upload
            workspace-shell.tsx            # Three-panel app shell
          outputs/
            output-panel.tsx               # Debug/testbench/Codex/waveform results
          upload/
            waveform-upload.tsx            # Image upload + waveform context
          ui/
            button.tsx                     # shadcn-style primitive

        hooks/                             # Frontend hooks as workflows grow
        lib/
          api-client.ts                    # Typed FastAPI calls
          utils.ts                         # UI helpers
        stores/
          workspace-store.ts               # Zustand workspace state
        types/
          api.ts                           # Frontend API contracts

      tests/

    api/
      README.md
      requirements.txt
      pyproject.toml
      .env.example

      app/
        main.py                            # FastAPI app, CORS, route mounting

        api/
          routes/
            debug_rtl.py                   # POST /debug-rtl
            generate_testbench.py          # POST /generate-testbench
            analyze_waveform.py            # POST /analyze-waveform
            codex_fix.py                   # POST /codex-fix

        core/
          config.py                        # Environment settings
          errors.py                        # Unified API error shape

        models/
          common.py                        # Issue + validation schemas
          rtl.py                           # RTL request/response schemas
          waveform.py                      # Waveform response schemas

        prompts/
          rtl.py                           # Hardware-specialized system prompts

        services/
          ai/
            openai_service.py              # Responses API, Codex, and Vision wrapper
            json_tools.py                  # JSON extraction/parsing helper
            rtl_debugger.py                # RTL debugger workflow
            testbench_generator.py         # Testbench workflow
          codex/
            fixer.py                       # Visible Codex Fix Mode workflow
          hardware/
            icarus.py                      # Best-effort Verilog validation
          waveform/
            analyzer.py                    # OpenAI vision waveform workflow

        utils/                             # Backend helpers when needed

      tests/

  docs/
    architecture.md
    api-contract.md
    roadmap.md
    project-architecture.md

  packages/
    shared/
      src/                                 # Reserved for shared contracts

  infra/                                  # Deployment config later
  scripts/                                # Local helper scripts later
```

## Frontend Pages

| Route | Purpose |
| --- | --- |
| `/` | Professional landing page for the hackathon demo. |
| `/workspace` | Core RTL workspace with assistant, Monaco editor, waveform upload, and outputs. |

The first viewport should sell the product quickly, but the real product is
the workspace. Avoid adding dashboards or account flows before the demo.

## Frontend Modules

### `app/`

Owns routing and global styling.

- `page.tsx`: startup-grade landing page
- `workspace/page.tsx`: mounts the MVP workspace
- `globals.css`: Tailwind base and dark product theme

### `components/layout/`

Owns product structure.

- `workspace-shell.tsx`: three-panel layout
- `action-bar.tsx`: top workflow controls

### `components/editor/`

Owns Monaco.

- `rtl-editor.tsx`: Verilog editor with word wrap, line numbers, and dark theme

### `components/assistant/`

Owns contextual assistant presentation.

- `assistant-panel.tsx`: left panel for AI/workflow context

### `components/outputs/`

Owns result rendering.

- `output-panel.tsx`: renders debug issues, generated testbenches, Codex fixes,
  waveform findings, and validation logs

### `components/upload/`

Owns waveform image handling.

- `waveform-upload.tsx`: file picker and expected-behavior context

### `stores/`

Owns local app state.

- `workspace-store.ts`: RTL text, selected workflow, loading state, errors,
  waveform file, waveform context, and latest result

### `lib/`

Owns reusable frontend utilities.

- `api-client.ts`: typed calls to FastAPI endpoints
- `utils.ts`: class merging and UI helpers

### `types/`

Owns TypeScript contracts for backend responses.

- `api.ts`: severity, validation, issue, RTL, Codex, testbench, and waveform
  response types

## Backend API Routes

| Method | Route | Module | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | `main.py` | Backend health check |
| `POST` | `/debug-rtl` | `routes/debug_rtl.py` | Analyze broken RTL and return issues plus corrected code |
| `POST` | `/generate-testbench` | `routes/generate_testbench.py` | Generate verification testbench from RTL |
| `POST` | `/analyze-waveform` | `routes/analyze_waveform.py` | Analyze waveform screenshot with vision |
| `POST` | `/codex-fix` | `routes/codex_fix.py` | Rewrite/improve RTL through visible Codex Fix Mode |

## Backend Services

### `services/ai/openai_service.py`

Single wrapper for OpenAI integration. Keeps model selection, API key handling,
Responses API text requests, Codex Fix Mode requests, and vision requests out of
route files.

### `services/ai/rtl_debugger.py`

Workflow service for RTL debugging.

Returns:

- summary
- issue list
- corrected RTL
- best-practice suggestions
- validation result

### `services/ai/testbench_generator.py`

Workflow service for testbench generation.

Returns:

- summary
- generated testbench
- coverage notes
- validation result

### `services/codex/fixer.py`

Workflow service for the visible `Fix with Codex` feature.

Returns:

- summary
- fixed RTL
- change list
- rationale
- validation result

### `services/waveform/analyzer.py`

Workflow service for waveform screenshots.

Returns:

- summary
- findings
- timing concerns
- confidence

### `services/hardware/icarus.py`

Optional validation layer. If `iverilog` is installed, run it with a timeout.
If unavailable, return `skipped` so the demo still works.

## Data Contracts

Backend Pydantic models live in `apps/api/app/models`.
Frontend TypeScript equivalents live in `apps/web/src/types/api.ts`.

Keep both intentionally simple for the MVP:

- `Issue`
- `ValidationResult`
- `DebugRtlResponse`
- `TestbenchResponse`
- `CodexFixResponse`
- `WaveformResponse`

This avoids a shared codegen step during the hackathon.

## AI Modules

| Capability | Backend service | OpenAI mode |
| --- | --- | --- |
| RTL Debugger | `services/ai/rtl_debugger.py` | Responses API |
| Testbench Generator | `services/ai/testbench_generator.py` | Responses API |
| Waveform Analyzer | `services/waveform/analyzer.py` | Vision via Responses API |
| Fix with Codex | `services/codex/fixer.py` | Codex-branded repair workflow |

Prompts live in `apps/api/app/prompts/rtl.py` so each workflow can be tuned
without changing route or UI code.

## Hackathon Optimization Rules

- Keep routes thin and services workflow-specific.
- Return structured JSON from AI services.
- Keep all state client-side in Zustand.
- Avoid databases until there is a clear persistence requirement.
- Avoid auth until deployment/demo needs it.
- Prefer demo-mode fallbacks over hard failures when `OPENAI_API_KEY` or
  `iverilog` is missing.
- Make all four judge-visible features accessible from `/workspace`.
