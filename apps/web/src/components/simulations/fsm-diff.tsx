"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { Check, Columns, GitCompare, ShieldAlert, Sparkles, X } from "lucide-react";
import { useState } from "react";

const CODE_ORIGINAL = `always @(posedge clk or negedge rst_n) begin
  if (!rst_n) begin
    state   <= IDLE;
    tx_out  <= 1'b1;
    bit_cnt <= 3'd0;
  end else begin
    case (state)
      IDLE: begin
        if (tx_en) begin
          state <= START;
          tx_out <= 1'b0; // Missing data setup
        end
      end
      START: begin
        state   <= DATA;
        tx_out  <= tx_data[0];
      end
      DATA: begin
        if (bit_cnt == 3'd7) begin
          state <= STOP;
        end else begin
          bit_cnt <= bit_cnt + 1;
          tx_out  <= tx_data[bit_cnt];
        end
      end
      STOP: begin
        tx_out <= 1'b1;
        state  <= IDLE;
      end
    endcase
  end
end`;

const CODE_OPTIMIZED = `always @(posedge clk or negedge rst_n) begin
  if (!rst_n) begin
    state   <= IDLE;
    tx_out  <= 1'b1;
    bit_cnt <= 3'd0;
  end else begin
    case (state)
      IDLE: begin
        if (tx_en) begin
          state <= START;
          tx_out <= 1'b0;
          tx_shift_reg <= tx_data; // Register load step
          bit_cnt <= 3'd0;
        end
      end
      START: begin
        state <= DATA;
        tx_out <= tx_shift_reg[0];
      end
      DATA: begin
        if (bit_cnt == 3'd7) begin
          state <= STOP;
        end else begin
          bit_cnt <= bit_cnt + 1;
          tx_out  <= tx_shift_reg[bit_cnt];
        end
      end
      STOP: begin
        tx_out <= 1'b1;
        state  <= IDLE;
      end
    endcase
  end
end`;

export function FsmDiff() {
  const setFileContent = useWorkspaceStore((state) => state.setFileContent);
  const setIsFsmFixing = useWorkspaceStore((state) => state.setIsFsmFixing);
  const addToast = useWorkspaceStore((state) => state.addToast);
  const setActiveNav = useWorkspaceStore((state) => state.setActiveNav);

  const [isDiffView, setIsDiffView] = useState(true);

  const uartFixedCode = `module uart_tx (
  input wire clk,
  input wire rst_n,
  input wire tx_en,
  input wire [7:0] tx_data,
  output reg tx_out,
  output reg tx_busy
);

reg [2:0] state;
reg [2:0] bit_cnt;
reg [7:0] tx_shift_reg;

parameter IDLE  = 3'd0;
parameter START = 3'd1;
parameter DATA  = 3'd2;
parameter STOP  = 3'd3;

${CODE_OPTIMIZED}

endmodule`;

  function acceptChanges() {
    setFileContent("uart_tx.v", uartFixedCode);
    addToast("Accepted FSM logic rewrite. Applied to uart_tx.v", "success");
    setIsFsmFixing(false);
    setActiveNav("workspace");
  }

  function discardChanges() {
    addToast("FSM logic rewrite discarded", "info");
    setIsFsmFixing(false);
    setActiveNav("workspace");
  }

  return (
    <div className="flex flex-col h-full bg-[#0b0d12] border-x border-line">
      {/* Tab bar header */}
      <div className="flex h-12 items-center justify-between border-b border-line px-4 bg-[#0d1017]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">src / fsm / uart_tx.v</span>
          <span className="text-sm font-semibold text-ink">Fixing FSM Logic</span>
          <span className="inline-flex items-center rounded-full border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[10px] font-medium text-cyan animate-pulse">
            ● Streaming Fix
          </span>
        </div>
        <button
          onClick={() => setIsDiffView(!isDiffView)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-xs text-ink hover:border-cyan/40 hover:bg-[#151923] transition select-none"
        >
          {isDiffView ? <Columns className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5" />}
          {isDiffView ? "Unified View" : "Diff View"}
        </button>
      </div>

      {/* Main Diff Area */}
      <div className="flex-1 min-h-0 overflow-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line bg-[#07090d]">
        
        {/* Left Side: Original */}
        <div className="flex flex-col min-h-0 p-4 font-mono text-xs leading-6">
          <div className="flex items-center justify-between border-b border-line/30 pb-2 mb-3">
            <span className="text-[10px] font-semibold tracking-wider text-[#ff8a9a] uppercase">Original (Broken)</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-amber">
              <ShieldAlert className="h-3 w-3" />
              Timing Violation
            </span>
          </div>
          <pre className="flex-1 overflow-auto text-slate-400 select-text p-2 rounded bg-black/30">
            {CODE_ORIGINAL}
          </pre>
        </div>

        {/* Right Side: Optimized */}
        <div className="flex flex-col min-h-0 p-4 font-mono text-xs leading-6">
          <div className="flex items-center justify-between border-b border-line/30 pb-2 mb-3">
            <span className="text-[10px] font-semibold tracking-wider text-green uppercase">AI Optimized</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-cyan">
              <Sparkles className="h-3 w-3" />
              Registered Outputs
            </span>
          </div>
          <pre className="flex-1 overflow-auto text-[#c7d2fe] select-text p-2 rounded bg-black/30">
            {CODE_OPTIMIZED}
          </pre>
        </div>

      </div>

      {/* Bottom Bar: Action */}
      <div className="border-t border-line bg-[#0d1017] px-4 py-3 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Sparkles className="h-4 w-4 text-cyan animate-pulse" />
          <span>VeriGen AI is rewriting the FSM logic...</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={discardChanges}
            className="inline-flex min-h-9 items-center justify-center rounded border border-line bg-surface px-4 text-xs font-semibold text-[#ff8a9a] hover:bg-[#20151a] hover:border-[#ff8a9a]/40 transition select-none"
          >
            Discard
          </button>
          <button
            onClick={acceptChanges}
            className="inline-flex min-h-9 items-center justify-center rounded bg-cyan text-[#071015] px-4 text-xs font-semibold hover:bg-white transition select-none"
          >
            Accept Changes
          </button>
        </div>
      </div>
    </div>
  );
}
