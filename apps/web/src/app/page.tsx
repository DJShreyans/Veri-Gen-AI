import { ArrowRight, Bot, Cpu, FolderOpen, Play, Rocket } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0d12] text-ink select-none font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <header className="flex h-14 items-center justify-between border-b border-line bg-[#090b10] px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10">
            <Cpu className="h-4.5 w-4.5 text-cyan" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-ink">VeriGen AI</span>
        </div>
        <nav className="hidden md:flex h-full items-center gap-6 text-sm font-medium">
          <Link href="/workspace" className="text-cyan border-b-2 border-cyan px-1 flex h-full items-center">
            Workspace
          </Link>
          <span className="text-muted hover:text-ink cursor-pointer transition">Projects</span>
          <span className="text-muted hover:text-ink cursor-pointer transition">Simulations</span>
          <span className="text-muted hover:text-ink cursor-pointer transition">Documentation</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="inline-flex min-h-9 items-center justify-center rounded bg-cyan text-[#071015] px-4 text-xs font-semibold hover:bg-white transition"
          >
            Deploy to FPGA
          </Link>
        </div>
      </header>

      {/* Main Banner / Content */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-16 verigen-grid">
        
        {/* Version Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1 text-xs font-medium text-cyan shadow-glow select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-ping" />
          VeriGen v2.0 Beta Live
        </div>

        {/* Headings */}
        <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl tracking-tight">
          Software engineers have Copilot. <br />
          <span className="bg-gradient-to-r from-cyan via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Hardware engineers deserve one too.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-xs md:text-sm leading-relaxed text-muted font-medium">
          Stop wrestling with arcane syntax and archaic tools. VeriGen AI is the first AI assistant <br className="hidden md:inline" />
          trained exclusively on SystemVerilog, VHDL, and modern silicon architecture patterns.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/workspace"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-cyan text-[#071015] px-5 font-semibold text-sm hover:bg-white active:scale-[0.98] transition"
          >
            <Rocket className="h-4 w-4" />
            Start Debugging
          </Link>
          <Link
            href="/workspace"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-line bg-surface/50 text-[#e8eefc] px-5 font-semibold text-sm hover:border-cyan/40 hover:bg-[#151923] active:scale-[0.98] transition"
          >
            <Play className="h-4 w-4 text-muted" />
            View Demo
          </Link>
        </div>

        {/* Mockup Workspace UI - Matches Screenshot 1 */}
        <div className="mt-12 w-full max-w-4xl rounded-lg border border-line/60 bg-[#07090d] shadow-glow overflow-hidden select-none">
          
          {/* Mock Header */}
          <div className="flex h-10 items-center justify-between border-b border-line bg-[#090b10] px-4">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green/80" />
            </div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">dma_controller_ai.sv</span>
            <div className="w-12" />
          </div>

          {/* Editor Columns */}
          <div className="grid grid-cols-[180px_1fr] h-[340px] text-left">
            
            {/* Explorer sidebar */}
            <div className="border-r border-line bg-[#090b10]/40 p-3 flex flex-col justify-start">
              <span className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1">
                <FolderOpen className="h-3 w-3 text-cyan" />
                Explorer
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-muted/70 pl-2 cursor-pointer hover:text-ink">alu_core.sv</div>
                <div className="text-cyan bg-cyan/5 border-l-2 border-cyan pl-2 py-0.5 cursor-pointer font-bold">
                  dma_controller_ai.sv
                </div>
                <div className="text-muted/70 pl-2 cursor-pointer hover:text-ink">testbench.sv</div>
              </div>
            </div>

            {/* Monaco mockup area */}
            <div className="flex flex-col min-h-0 bg-[#0b0d12]">
              
              {/* Tab headers */}
              <div className="flex h-8 items-center bg-[#0d1017] border-b border-line px-2 font-mono text-[10px] text-muted">
                <span className="px-3 py-1 bg-[#0b0d12] text-cyan border-r border-line">dma_controller_ai.sv</span>
                <span className="px-3 py-1">alu_core.sv</span>
              </div>

              {/* Verilog code viewport */}
              <pre className="flex-1 overflow-auto p-5 text-[11px] leading-6 font-mono text-slate-300 select-text bg-[#0b0d12]">
                <span className="text-[#a78bfa]">module</span> dma_controller (
                  <span className="text-cyan">input logic</span> clk,
                  <span className="text-cyan">input logic</span> rst_n,
                  <span className="text-cyan">input logic</span> [31:0] src_addr,
                  <span className="text-cyan">input logic</span> [31:0] dest_addr
                );

                <span className="text-slate-500">{"// User prompt: Optimize burst transfer logic for AXI4"}</span>
                
                {/* Highlights for AI suggestion */}
                <div className="relative mt-2 border border-green/30 bg-green/5 p-3 rounded-md">
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-green/10 border border-green/20 px-1.5 py-0.5 text-[8px] font-semibold text-green uppercase tracking-wider">
                    <Bot className="h-2 w-2" />
                    AI Suggestion
                  </span>
                  always_ff @(posedge clk or negedge rst_n) begin
                    if (!rst_n) begin
                      burst_cnt &lt;= &apos;0;
                      state &lt;= IDLE;
                    end else begin
                      <span className="text-slate-400">{"// Optimized AXI4 state machine"}</span>
                      case (state)
                        ...
                      end
                    end
                  end
                </div>
              </pre>

            </div>

          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-[#090b10] px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0 text-[11px] text-muted font-medium select-none">
        <span className="text-ink font-semibold tracking-wide flex items-center gap-1">
          <Cpu className="h-3 w-3 text-cyan" />
          VeriGen AI
        </span>
        <span>© 2026 VeriGen AI. All rights reserved. Silicon-grade precision.</span>
        <div className="flex gap-4">
          <span className="hover:text-ink cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-ink cursor-pointer transition">Terms of Service</span>
          <span className="hover:text-ink cursor-pointer transition">Security</span>
        </div>
      </footer>

    </main>
  );
}
