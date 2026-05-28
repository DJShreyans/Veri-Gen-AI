# VeriGen AI 7-Day Implementation Roadmap

## Guiding Principle

Build the smallest impressive product that proves VeriGen AI is a real RTL
workflow copilot, not a generic chatbot. Every feature should be demoable from
the workspace UI.

## Day 1: Foundation

Goals:

- Initialize monorepo structure
- Create Next.js 14 frontend
- Create FastAPI backend
- Add Tailwind, shadcn/ui, Monaco, Zustand
- Add OpenAI SDK and backend settings
- Define shared API contracts

Deliverable:

- Landing page shell
- Workspace shell
- Backend health endpoint
- Frontend can call backend

## Day 2: RTL Debugger

Goals:

- Implement `POST /debug-rtl`
- Create hardware-specialized debugger prompt
- Return structured issues, explanation, corrected RTL, and validation logs
- Add Monaco editor input
- Add right-panel result renderer

Deliverable:

- User pastes broken Verilog and gets actionable debug output.

## Day 3: Testbench Generator

Goals:

- Implement `POST /generate-testbench`
- Generate clock/reset/stimulus/monitors/edge cases
- Add testbench result tab or output section
- Optionally validate generated RTL plus testbench with Icarus

Deliverable:

- User clicks Generate Testbench and receives usable testbench code.

## Day 4: Codex Fix Mode

Goals:

- Implement `POST /codex-fix`
- Make Codex Fix Mode visibly distinct in the UI
- Return rewritten RTL, changes made, and rationale
- Emphasize style, structure, synthesizability, and anti-pattern removal

Deliverable:

- Hackathon judges can clearly see Codex as a product feature.

## Day 5: Waveform Analyzer

Goals:

- Implement `POST /analyze-waveform`
- Add waveform image upload and preview
- Use OpenAI vision to analyze signal behavior
- Return findings, suspicious transitions, reset issues, timing concerns

Deliverable:

- User uploads waveform screenshot and gets hardware-aware interpretation.

## Day 6: Product Polish

Goals:

- Improve landing page visual quality
- Improve workspace density and interaction states
- Add loading, empty, error, and retry states
- Add sample RTL snippets
- Add copy buttons and download actions
- Add basic frontend/backend tests for critical paths

Deliverable:

- Product feels startup-grade and demo-ready.

## Day 7: Demo Hardening

Goals:

- Deploy frontend and backend
- Configure CORS and environment variables
- Prepare demo scripts
- Test all four features end-to-end
- Add fallback messages for missing Icarus or API errors
- Record or rehearse the judge flow

Deliverable:

- Stable hosted MVP with a crisp demo path.

## Demo Script

1. Open landing page and state the positioning: Cursor/Copilot for RTL engineers.
2. Enter workspace and paste broken RTL.
3. Click Debug RTL and show issue detection plus corrected code.
4. Click Generate Testbench and show verification scaffold.
5. Click Fix with Codex and show visible RTL rewrite workflow.
6. Upload waveform screenshot and show multimodal hardware reasoning.
7. Close with why this is different from ChatGPT: integrated RTL workflow,
   editor context, validation, waveform reasoning, and Codex-assisted repair.

## MVP Cut Line

Must ship:

- Next.js workspace
- FastAPI backend
- OpenAI-powered RTL debug
- OpenAI-powered testbench generation
- OpenAI vision waveform analysis
- visible Codex Fix Mode

Nice to have:

- project file tree
- persistent sessions
- GitHub import
- GTKWave integration
- waveform file parsing
- collaborative comments
- user authentication

Explicitly defer:

- full EDA simulation platform
- complete SystemVerilog/UVM support
- synthesis or place-and-route integrations
- enterprise project indexing
