"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useState } from "react";

export function WaveformModal() {
  const isOpen = useWorkspaceStore((state) => state.isWaveformModalOpen);
  const setIsOpen = useWorkspaceStore((state) => state.setIsWaveformModalOpen);
  const setRtl = useWorkspaceStore((state) => state.setRtl);
  const addToast = useWorkspaceStore((state) => state.addToast);
  
  const [selectedReport, setSelectedReport] = useState<"timing" | "reset" | "setuphold">("setuphold");

  if (!isOpen) return null;

  const correctedAluCode = `module alu (
  input wire clk,
  input wire rst,
  input wire [31:0] data_a,
  input wire [31:0] data_b,
  output reg [31:0] alu_out,
  output reg carry // Added overflow bit to prevent truncation timing issues
);

// AI suggestion: registered pipelined stage to resolve setup violation
reg [31:0] data_a_reg;
reg [31:0] data_b_reg;

always @(posedge clk) begin
  if (rst) begin
    data_a_reg <= 32'b0;
    data_b_reg <= 32'b0;
    alu_out    <= 32'b0;
    carry      <= 1'b0;
  end else begin
    data_a_reg <= data_a;
    data_b_reg <= data_b;
    {carry, alu_out} <= data_a_reg + data_b_reg;
  end
end

endmodule`;

  function applyFix() {
    setRtl(correctedAluCode);
    addToast("Pipelined stage and overflow fix applied to editor", "success");
    setIsOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[85vh] min-h-[500px] bg-[#0b0d12] border border-line rounded-lg overflow-hidden shadow-glow flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-[#090b10] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10">
              <AlertCircle className="h-4.5 w-4.5 text-cyan" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink">AI Waveform Analysis</h2>
              <p className="text-xs text-muted">Intelligent signal trace verification reports</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green/30 bg-green/10 px-2.5 py-0.5 text-xs font-medium text-green select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-green animate-ping" />
              Analysis Complete
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1.5 text-muted hover:bg-line hover:text-ink transition"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-line">
          
          {/* Left Panel: Waveform Chart */}
          <div className="flex flex-col min-h-0 bg-[#07090d] verigen-grid">
            <div className="flex items-center justify-between border-b border-line/40 px-4 py-2 bg-[#090b10]/40 text-xs text-muted">
              <span>Time: 145.2ns - 180.0ns</span>
              <span className="text-cyan font-semibold">Active Selection: Setup/Hold Alert Zone</span>
            </div>

            {/* Custom SVG Waveform Timeline */}
            <div className="flex-1 overflow-auto p-4 flex flex-col justify-around min-h-[300px]">
              
              {/* clk */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                <span className="text-xs font-mono text-muted text-right">clk</span>
                <svg className="w-full h-8 stroke-cyan stroke-[1.5] fill-none">
                  <path d="M 0,22 L 40,22 L 40,4 L 80,4 L 80,22 L 120,22 L 120,4 L 160,4 L 160,22 L 200,22 L 200,4 L 240,4 L 240,22 L 280,22 L 280,4 L 320,4 L 320,22 L 360,22 L 360,4 L 400,4 L 400,22" />
                </svg>
              </div>

              {/* rst_n */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                <span className="text-xs font-mono text-muted text-right">rst_n</span>
                <svg className="w-full h-8 stroke-amber stroke-[1.5] fill-none">
                  <path d="M 0,4 L 130,4 L 130,22 L 400,22" />
                  {/* Instability Marker */}
                  <circle cx="130" cy="13" r="5" className="fill-amber/20 stroke-amber animate-pulse" />
                </svg>
              </div>

              {/* data_in[7:0] */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                <span className="text-xs font-mono text-[#66e3ff] text-right bg-cyan/5 px-1 py-0.5 rounded border border-cyan/20">data_in[7:0]</span>
                <div className="relative">
                  <svg className="w-full h-8 stroke-[#66e3ff] stroke-[1.5] fill-none">
                    <path d="M 0,13 L 10,4 L 90,4 L 100,13 L 90,22 L 10,22 Z" />
                    <path d="M 100,13 L 110,4 L 220,4 L 230,13 L 220,22 L 110,22 Z" />
                    {/* Setup error marker */}
                    <circle cx="225" cy="13" r="6" className="fill-red-500/20 stroke-red-500 animate-pulse" />
                    
                    <path d="M 230,13 L 240,4 L 350,4 L 360,13 L 350,22 L 240,22 Z" />
                    <path d="M 360,13 L 370,4 L 400,4 M 360,13 L 370,22 L 400,22" />
                  </svg>
                  {/* Violation Zone Highlight */}
                  <div className="absolute left-[200px] top-[-8px] bottom-[-8px] w-[50px] bg-red-500/10 border-x border-dashed border-red-500/30" />
                </div>
              </div>

              {/* valid_out */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                <span className="text-xs font-mono text-[#ff8a9a] text-right">valid_out</span>
                <svg className="w-full h-8 stroke-[#ff8a9a] stroke-[1.5] fill-none">
                  <path d="M 0,22 L 80,22 L 80,4 L 260,4 L 260,22 L 400,22" />
                  {/* Mismatch Marker */}
                  <circle cx="80" cy="13" r="5" className="fill-red-400/20 stroke-red-400 animate-ping" />
                </svg>
              </div>

            </div>
          </div>

          {/* Right Panel: Diagnostic Reports */}
          <div className="flex flex-col min-h-0 bg-[#090b10] p-4 justify-between">
            <div className="flex-1 min-h-0 overflow-auto space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">Diagnostic Report</p>
              
              {/* Report 1 */}
              <div
                onClick={() => setSelectedReport("timing")}
                className={`rounded-md border p-3 cursor-pointer transition ${
                  selectedReport === "timing" ? "border-amber bg-amber/5" : "border-line bg-surface/50 hover:bg-surface"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${selectedReport === "timing" ? "text-amber" : "text-muted"}`} />
                  <div>
                    <h3 className="text-xs font-semibold text-ink">Timing Mismatch</h3>
                    <p className="text-[10px] text-muted mt-0.5">@ 152.4ns</p>
                    <p className="text-xs text-muted mt-1 leading-5">
                      `valid_out` asserts 1 cycle early relative to standard AXI protocol expectation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Report 2 */}
              <div
                onClick={() => setSelectedReport("reset")}
                className={`rounded-md border p-3 cursor-pointer transition ${
                  selectedReport === "reset" ? "border-amber bg-amber/5" : "border-line bg-surface/50 hover:bg-surface"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Info className={`h-4 w-4 mt-0.5 ${selectedReport === "reset" ? "text-amber" : "text-muted"}`} />
                  <div>
                    <h3 className="text-xs font-semibold text-ink">Unstable Reset</h3>
                    <p className="text-[10px] text-muted mt-0.5">@ 160.0ns</p>
                    <p className="text-xs text-muted mt-1 leading-5">
                      `rst_n` deasserts dangerously close to posedge `clk`.
                    </p>
                  </div>
                </div>
              </div>

              {/* Report 3 */}
              <div
                onClick={() => setSelectedReport("setuphold")}
                className={`rounded-md border p-3 cursor-pointer transition ${
                  selectedReport === "setuphold" ? "border-cyan bg-cyan/5 shadow-glow" : "border-line bg-surface/50 hover:bg-surface"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-cyan mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-ink">Setup/Hold Violation</h3>
                    <p className="text-[10px] text-cyan mt-0.5">@ 164.2ns</p>
                    <p className="text-xs text-muted mt-1.5 leading-5">
                      Data transition on `data_in[7:0]` violates setup time (Tsu) constraint for the target flip-flop.
                    </p>
                    {selectedReport === "setuphold" && (
                      <div className="mt-3 rounded border border-line bg-panel p-2.5 text-[11px] leading-5 text-muted">
                        <span className="font-semibold text-cyan">✦ Root Cause:</span> Combinational path depth in module `alu_core` exceeds 4ns target. Suggest registering outputs or pipelining the multiplier stage to resolve the critical path.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="border-t border-line/40 pt-4 mt-4 space-y-2.5">
              <button
                onClick={applyFix}
                className="w-full inline-flex min-h-10 items-center justify-center rounded bg-cyan text-[#071015] font-semibold text-sm transition hover:bg-white active:scale-[0.98]"
              >
                Apply Fix to RTL
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  addToast("Review suggested pipeline registers changes", "info");
                }}
                className="w-full text-center text-xs text-cyan hover:underline transition select-none"
              >
                View Suggested Diff
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
