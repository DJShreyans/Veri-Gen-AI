# VeriGen AI Architecture

## Product Positioning

VeriGen AI is a contextual RTL engineering workspace, not a generic chatbot.
The product should feel closer to Cursor for hardware than to a prompt box:
project-aware, code-aware, waveform-aware, and built around real verification
tasks.

## MVP System Flow

```text
Next.js workspace
  -> FastAPI endpoint
    -> request validation
    -> OpenAI Responses API / vision / Codex mode prompt
    -> optional Icarus Verilog validation
    -> structured engineering response
  -> UI renders explanation, corrected RTL, testbench, or waveform findings
```

## Frontend Architecture

The frontend lives in `apps/web` and should use:

- Next.js 14 App Router
- React and TypeScript
- Tailwind CSS
- shadcn/ui for accessible base components
- Monaco Editor for RTL editing
- Zustand for workspace state

Primary screens:

- `/(marketing)`: professional landing page with direct CTA into workspace
- `/workspace`: three-panel engineering environment

Workspace layout:

- Left panel: assistant context and interaction history
- Center panel: Monaco RTL editor
- Right panel: structured analysis, generated RTL, testbench, and validation logs
- Top bar: waveform upload, project controls, action buttons

Core frontend modules:

- `components/editor`: Monaco setup, language defaults, editor actions
- `components/assistant`: conversational context and result timeline
- `components/outputs`: code blocks, diagnostics, waveform findings
- `components/upload`: waveform screenshot upload and preview
- `lib/api-client.ts`: typed backend calls
- `stores/workspace-store.ts`: RTL text, selected mode, result state, uploads
- `types/api.ts`: request and response interfaces

## Backend Architecture

The backend lives in `apps/api` and should use:

- FastAPI
- Pydantic schemas
- OpenAI Responses API
- Python service modules per workflow
- Optional subprocess wrapper for Icarus Verilog

Endpoint ownership:

- `routes/debug_rtl.py`: syntax, logic, race, and style analysis
- `routes/generate_testbench.py`: testbench generation
- `routes/analyze_waveform.py`: image upload and vision reasoning
- `routes/codex_fix.py`: Codex-branded RTL rewrite mode

Service ownership:

- `services/ai/openai_service.py`: shared Responses API, Codex, and Vision setup
- `services/ai/rtl_debugger.py`: RTL debugger prompt and parsing
- `services/ai/testbench_generator.py`: testbench prompt and parsing
- `services/waveform/analyzer.py`: image handling and waveform reasoning
- `services/codex/fixer.py`: visible Codex Fix Mode orchestration
- `services/hardware/icarus.py`: temporary compile validation with `iverilog`

## AI Design

Each AI feature should return structured data rather than raw prose wherever
possible. The UI can still render polished explanations, but the backend should
preserve fields like:

- `summary`
- `issues`
- `corrected_code`
- `generated_testbench`
- `validation`
- `warnings`
- `next_steps`

Hardware-specific prompts should require the model to reason about:

- Verilog syntax
- sequential versus combinational logic
- blocking versus non-blocking assignments
- reset behavior
- race conditions
- synthesizability
- timing and waveform consistency
- verification edge cases

## Icarus Verilog Validation

For MVP speed, Icarus should be used as a best-effort validator:

- write RTL/testbench into temporary files
- run `iverilog` with a timeout
- capture stdout, stderr, and exit code
- return validation logs to the UI

If `iverilog` is unavailable in deployment, the backend should degrade gracefully
and mark validation as skipped.

## Error Handling

Frontend:

- typed API errors
- action-level loading states
- retryable failures
- visible validation logs

Backend:

- request validation errors
- OpenAI API failures
- file upload limits
- unsupported image types
- Icarus timeout or missing binary

## Deployment Shape

- Frontend: Vercel
- Backend: Render or Railway
- Secrets:
  - `OPENAI_API_KEY`
  - optional `OPENAI_MODEL`
  - optional `OPENAI_VISION_MODEL`
- CORS configured for local and deployed frontend origins
