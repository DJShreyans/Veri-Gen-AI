# VeriGen AI — Hackathon Submission Blueprint
> **The GitHub Copilot & Cursor Workspace for RTL & Digital Hardware Engineers.**

---

## 🚀 Pitch Video / Live Demo
- **Repository URL:** [github.com/DJShreyans/Veri-Gen-AI](https://github.com/DJShreyans/Veri-Gen-AI)
- **Local Portals:** Frontend workspace: `http://localhost:4000` | Backend API Docs: `http://localhost:8000/docs`

---

## 💡 The Vision
Software developers are living in the golden age of developer velocity, backed by Cursor, GitHub Copilot, and LLM-native IDEs. Yet, **digital hardware engineers and VLSI designers** are left behind. They still spend hours wrestling with archaic text editors, manually checking logic truncation warnings, hand-writing repetitive stimulus testbenches, and debugging timing diagrams step-by-step. 

**VeriGen AI is a hardware-native AI workspace designed to solve this.** 
It combines local compiler diagnostics (Icarus Verilog) with advanced LLM reasoning and multimodal vision models to enable real-time debugging, automated testbench generation, waveform signal analysis, and inline logic repairs.

---

## 🛠️ Key Product Features

### 1️⃣ AI-Assisted RTL Debugger (Screenshot 2)
- **Problem:** Missing semicolons, blocking assignments in sequential blocks, or truncation risks cause silent failures or long compilation loops.
- **Solution:** VeriGen compiles code with Icarus Verilog, captures errors/warnings, and passes them to a hardware-specialized AI model.
- **Implementation:** surfers detailed logic error warning cards, renders a color-coded syntax difference comparison, and features an **Apply Fix** button that replaces the editor code instantly.

### 2️⃣ Intelligent Testbench Generator
- **Problem:** Writing testbenches (stimulus vectors, clock generation, reset asserts) is repetitive, yet vital for verification.
- **Solution:** VeriGen extracts the module interface and automatically writes complete SystemVerilog/Verilog testbenches.
- **Implementation:** Generates timescale setups, clock cycles, reset pulses, inputs stimulus vectors, and custom monitor blocks, complete with validation checks.

### 3️⃣ Multimodal AI Waveform Analyzer (Screenshot 3)
- **Problem:** Timing diagrams (waveforms) are hard to read and require manual measurement of clock edges to catch setup/hold violations.
- **Solution:** Upload a waveform screenshot, and our multimodal Vision API reads the signal transitions.
- **Implementation:** Renders an interactive waveform diagnostic modal with warning/error cards outlining:
  - **Timing Mismatches:** Cycle assertions violating protocol guidelines.
  - **Reset Instability:** Reset deassertions dangerously close to clock edges.
  - **Setup/Hold Violations:** Transition edges violating target gate setup times (Tsu).
  - Features an **Apply Fix to RTL** button to insert pipelined registers.

### 4️⃣ Simulations FSM Diff Workspace (Screenshot 4)
- **Problem:** Fixing State Machine (FSM) control logic requires side-by-side comparison of old state diagrams and new ones.
- **Solution:** VeriGen provides a dedicated side-by-side code editor for FSM fixing.
- **Implementation:** Left side displays original timing-violated code; right side displays AI-optimized registered output code. Features **Accept Changes** and **Discard** buttons.

---

## ⚙️ Tech Stack & Architecture

```text
       [ Next.js 14 Workspace UI ] <----> [ Monaco Editor Canvas ]
                  │
                  ▼ (REST / multipart uploads)
         [ FastAPI Backend ]
          ├── core/ (Uvicorn, Cors, Config Settings)
          ├── services/ai/ (Completions API, Vision, Codex prompt templates)
          └── services/hardware/ (Icarus Verilog Compiler Subprocess)
```

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Monaco Editor, Lucide Icons.
- **Backend:** FastAPI (Python), Pydantic schemas, OpenAI SDK (Gemini-completions compatibility endpoint).
- **Simulation Layer:** Icarus Verilog compiler pipeline.

---

## 🛡️ Robustness & Code Quality Metrics
VeriGen AI has been engineered with strict production standards:
- **TypeScript Compliance:** 100% type-safe compilation checks (`tsc --noEmit` exits with `0` errors).
- **ESLint Linting:** Integrated with `next/core-web-vitals` rules, resolving all JSX node and entity warnings to guarantee smooth deployment.
- **Unit Testing:** 14/14 python test cases cover endpoint models, prompt schemas, and fallbacks.

---

## 🏃‍♂️ E2E Verification Script (For Judges)

Here is how you can demo and judge the application in under 3 minutes:

### Step 1: Landing Page (Screenshot 1)
1. Open `http://localhost:4000` in Chrome.
2. Observe the premium dark-mode grid mesh and the glowing gradient banner.
3. Review the mock explorer tree and AI Suggestion box.
4. Click **Start Debugging** to load the workspace.

### Step 2: RTL Debugger & Waveforms (Screenshot 2)
1. Select `alu.v` in the editor (default sample).
2. Note the **Analysis** panel on the right highlighting a **Logic Error Detected** (Truncation risk on line 12).
3. Look at the bottom **tb_alu Simulation** panel showing SVG digital clock lines. Zoom in or out using the toolbar controls.
4. Click **Apply Fix** in the analysis card. Note the Monaco editor code instantly updates to register an overflow carry bit, and a green success notification slides up.

### Step 3: AI Assistant Conversational Chat
1. In the left panel, type: *"Should I use synchronous or asynchronous resets for active-low designs?"*
2. Hit Send. Verify the animated `"Thinking..."` bubble displays, followed by a detailed markdown response on hardware resets.

### Step 4: AI Waveform Modal (Screenshot 3)
1. Click the **Waveforms** menu in the left sidebar.
2. The modal overlay opens, rendering clock cycles, unstable resets, and setup/hold violations.
3. Click **Apply Fix to RTL** to automatically inject registers.

### Step 5: Simulations Diff Workspace (Screenshot 4)
1. Click **Simulations** in the top navigation bar.
2. The screen splits into a side-by-side diff comparing the original FSM logic against the AI-optimized FSM logic.
3. Click **Accept Changes** to save the optimized code.
