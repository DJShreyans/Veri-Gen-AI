"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  Bell,
  Cpu,
  FolderOpen,
  Bot,
  LineChart,
  Network,
  Activity,
  Terminal,
  HelpCircle,
  Settings,
  User,
  Plus
} from "lucide-react";
import Link from "next/link";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { RtlEditor } from "@/components/editor/rtl-editor";
import { ActionBar } from "@/components/layout/action-bar";
import { OutputPanel } from "@/components/outputs/output-panel";
import { SimulationWaveform } from "@/components/outputs/simulation-waveform";
import { WaveformModal } from "@/components/dialogs/waveform-modal";
import { FsmDiff } from "@/components/simulations/fsm-diff";
import { Toaster } from "@/components/ui/toaster";

export function WorkspaceShell() {
  const activeNav = useWorkspaceStore((state) => state.activeNav);
  const setActiveNav = useWorkspaceStore((state) => state.setActiveNav);
  const activeSidebar = useWorkspaceStore((state) => state.activeSidebar);
  const setActiveSidebar = useWorkspaceStore((state) => state.setActiveSidebar);
  const isFsmFixing = useWorkspaceStore((state) => state.isFsmFixing);
  const setIsFsmFixing = useWorkspaceStore((state) => state.setIsFsmFixing);
  const activeFile = useWorkspaceStore((state) => state.activeFile);
  const addToast = useWorkspaceStore((state) => state.addToast);

  function deployToFpga() {
    addToast("Synthesizing design and mapping logic blocks for Xilinx Ultrascale+...", "info");
    setTimeout(() => {
      addToast("FPGA synthesis passed. Bitstream generated successfully.", "success");
    }, 2000);
  }

  return (
    <main className="flex h-screen min-h-[720px] flex-col bg-[#0b0d12] text-ink select-none font-sans overflow-hidden">
      
      {/* Global Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-line bg-[#090b10] px-4 shrink-0">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10">
            <Cpu className="h-4.5 w-4.5 text-cyan" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-ink">VeriGen AI</span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex h-full items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveNav("workspace")}
            className={`flex h-full items-center border-b-2 px-1 transition ${
              activeNav === "workspace"
                ? "border-cyan text-cyan"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => setActiveNav("projects")}
            className={`flex h-full items-center border-b-2 px-1 transition ${
              activeNav === "projects"
                ? "border-cyan text-cyan"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => {
              setActiveNav("simulations");
              setIsFsmFixing(true); // Toggle FSM diff view automatically when simulation clicked
            }}
            className={`flex h-full items-center border-b-2 px-1 transition ${
              activeNav === "simulations"
                ? "border-cyan text-cyan"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Simulations
          </button>
          <button
            onClick={() => setActiveNav("documentation")}
            className={`flex h-full items-center border-b-2 px-1 transition ${
              activeNav === "documentation"
                ? "border-cyan text-cyan"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Documentation
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={deployToFpga}
            className="inline-flex min-h-9 items-center justify-center rounded bg-cyan text-[#071015] px-4 text-xs font-semibold hover:bg-white active:scale-[0.98] transition"
          >
            Deploy to FPGA
          </button>
          
          <button className="text-muted hover:text-ink transition" title="Settings">
            <Settings className="h-4.5 w-4.5" />
          </button>
          
          <button className="text-muted hover:text-ink transition relative" title="Notifications">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <div className="h-7 w-7 rounded-full border border-line bg-surface flex items-center justify-center text-muted" title="Profile">
            <User className="h-4 w-4" />
          </div>
        </div>
      </header>

      {/* Main App Workspace Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-56 shrink-0 border-r border-line bg-[#0d1017] flex flex-col justify-between select-none">
          <div>
            {/* Project Selector Box */}
            <div className="p-3 border-b border-line">
              <div className="rounded border border-line bg-[#151923] p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-cyan/15 flex items-center justify-center border border-cyan/20">
                    <span className="text-[10px] font-bold text-cyan">PA</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ink truncate leading-none">Project Alpha</h3>
                    <span className="text-[9px] text-muted">Xilinx Ultrascale+</span>
                  </div>
                </div>
                <button
                  onClick={() => addToast("Created a new RTL module template", "success")}
                  className="mt-1 w-full inline-flex h-7 items-center justify-center gap-1.5 rounded border border-line bg-surface/50 text-[10px] font-medium text-ink hover:bg-surface transition"
                >
                  <Plus className="h-3 w-3 text-cyan" />
                  New Module
                </button>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => setActiveSidebar("explorer")}
                className={`w-full flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium transition ${
                  activeSidebar === "explorer" ? "bg-surface text-cyan border-l-2 border-cyan" : "text-muted hover:bg-surface/50 hover:text-ink"
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                Explorer
              </button>
              <button
                onClick={() => setActiveSidebar("copilot")}
                className={`w-full flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium transition ${
                  activeSidebar === "copilot" ? "bg-surface text-cyan border-l-2 border-cyan" : "text-muted hover:bg-surface/50 hover:text-ink"
                }`}
              >
                <Bot className="h-4 w-4" />
                AI Copilot
              </button>
              <button
                onClick={() => setActiveSidebar("waveforms")}
                className={`w-full flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium transition ${
                  activeSidebar === "waveforms" ? "bg-surface text-cyan border-l-2 border-cyan" : "text-muted hover:bg-surface/50 hover:text-ink"
                }`}
              >
                <LineChart className="h-4 w-4" />
                Waveforms
              </button>
              <button
                onClick={() => setActiveSidebar("hierarchy")}
                className={`w-full flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium transition ${
                  activeSidebar === "hierarchy" ? "bg-surface text-cyan border-l-2 border-cyan" : "text-muted hover:bg-surface/50 hover:text-ink"
                }`}
              >
                <Network className="h-4 w-4" />
                Hierarchy
              </button>
              <button
                onClick={() => setActiveSidebar("vitals")}
                className={`w-full flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium transition ${
                  activeSidebar === "vitals" ? "bg-surface text-cyan border-l-2 border-cyan" : "text-muted hover:bg-surface/50 hover:text-ink"
                }`}
              >
                <Activity className="h-4 w-4" />
                Vitals
              </button>
            </div>
          </div>

          {/* Bottom Sidebar Items */}
          <div className="p-2 border-t border-line space-y-1">
            <button className="w-full flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium text-muted hover:bg-surface/50 hover:text-ink transition">
              <Terminal className="h-4 w-4" />
              Terminal
            </button>
            <button className="w-full flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium text-muted hover:bg-surface/50 hover:text-ink transition">
              <HelpCircle className="h-4 w-4" />
              Help
            </button>
          </div>
        </aside>

        {/* Right Dashboard Area depending on top tab navigation */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          
          {activeNav === "workspace" && (
            <>
              <ActionBar />
              <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
                {/* Assistant column */}
                <AssistantPanel />
                
                {/* Editor column */}
                {isFsmFixing && activeFile === "uart_tx.v" ? (
                  <div className="flex-1 min-h-0">
                    <FsmDiff />
                  </div>
                ) : (
                  <RtlEditor />
                )}

                {/* Right analysis output panel */}
                {!isFsmFixing && <OutputPanel />}
              </div>

              {/* Bottom waveform panel */}
              <SimulationWaveform />
            </>
          )}

          {activeNav === "simulations" && (
            <div className="flex-1 min-h-0">
              <FsmDiff />
            </div>
          )}

          {activeNav === "projects" && (
            <div className="flex-1 p-6 flex items-center justify-center bg-[#07090d]">
              <div className="text-center space-y-3 max-w-md">
                <FolderOpen className="h-10 w-10 text-cyan mx-auto animate-pulse" />
                <h2 className="text-lg font-bold text-ink">Project Registry</h2>
                <p className="text-sm text-muted">
                  Manage digital libraries, Xilinx IP cores, VHDL structures, and register maps.
                </p>
              </div>
            </div>
          )}

          {activeNav === "documentation" && (
            <div className="flex-1 p-6 flex items-center justify-center bg-[#07090d]">
              <div className="text-center space-y-3 max-w-md">
                <Cpu className="h-10 w-10 text-cyan mx-auto animate-pulse" />
                <h2 className="text-lg font-bold text-ink">VeriGen Documentation</h2>
                <p className="text-sm text-muted">
                  SystemVerilog LRM references, timing analysis guidelines, and prompt cookbook.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Waveform Diagnostic Modal overlay */}
      <WaveformModal />
      <Toaster />

    </main>
  );
}
