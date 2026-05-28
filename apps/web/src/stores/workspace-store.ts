"use client";

import { create } from "zustand";
import type { ActionMode, ResultPayload } from "@/types/api";

export type NavTab = "workspace" | "projects" | "simulations" | "documentation";
export type SidebarTab = "explorer" | "copilot" | "waveforms" | "hierarchy" | "vitals";

const FILE_ALU = `module alu (
  input wire clk,
  input wire rst,
  input wire [31:0] data_a,
  input wire [31:0] data_b,
  output reg [31:0] alu_out
);

always @(posedge clk) begin
  if (rst) begin
    alu_out <= 32'b0;
  end else begin
    alu_out <= data_a + data_b; // Warning: truncation risk
  end
end

endmodule`;

const FILE_TB_ALU = `module tb_alu;
  reg clk;
  reg rst;
  reg [31:0] data_a;
  reg [31:0] data_b;
  wire [31:0] alu_out;

  alu dut (
    .clk(clk),
    .rst(rst),
    .data_a(data_a),
    .data_b(data_b),
    .alu_out(alu_out)
  );

  initial clk = 0;
  always #5 clk = ~clk;

  initial begin
    rst = 1;
    #10 rst = 0;
    data_a = 32'd10;
    data_b = 32'd20;
    #50 $finish;
  end
endmodule`;

const FILE_DMA = `module dma_controller (
  input logic clk,
  input logic rst_n,
  input logic [31:0] src_addr,
  input logic [31:0] dest_addr
);

// User prompt: Optimize burst transfer logic for AXI4

always_ff @(posedge clk or negedge rst_n) begin
  if (!rst_n) begin
    burst_cnt <= '0;
    state <= IDLE;
  end else begin
    // Optimized AXI4 state machine
    case (state)
      IDLE: begin
        if (transfer_start) begin
          state <= BURST;
        end
      end
      BURST: begin
        burst_cnt <= burst_cnt + 1;
        state <= DONE;
      end
      default: state <= IDLE;
    endcase
  end
end

endmodule`;

const FILE_UART = `module uart_tx (
  input wire clk,
  input wire rst_n,
  input wire tx_en,
  input wire [7:0] tx_data,
  output reg tx_out,
  output reg tx_busy
);

// FSM Logic for UART Transmitter
always @(posedge clk or negedge rst_n) begin
  if (!rst_n) begin
    state <= IDLE;
    tx_out <= 1'b1;
    bit_cnt <= 3'd0;
  end else begin
    case (state)
      IDLE: begin
        if (tx_en) begin
          state <= START;
          // tx_out <= 1'b0; // Timing violation risk
        end
      end
      START: begin
        state <= DATA;
        tx_out <= tx_data[0];
      end
      default: state <= IDLE;
    endcase
  end
end

endmodule`;

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface WorkspaceState {
  rtl: string;
  activeMode: ActionMode;
  result: ResultPayload | null;
  isLoading: boolean;
  error: string | null;
  waveformFile: File | null;
  waveformContext: string;
  toasts: Toast[];
  
  // Premium UI extensions
  activeNav: NavTab;
  activeSidebar: SidebarTab;
  activeFile: string;
  files: Record<string, string>;
  isWaveformModalOpen: boolean;
  isFsmFixing: boolean;
  fsmFixState: "idle" | "streaming" | "ready";

  setRtl: (rtl: string) => void;
  setActiveMode: (mode: ActionMode) => void;
  setResult: (result: ResultPayload | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setWaveformFile: (file: File | null) => void;
  setWaveformContext: (context: string) => void;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;

  // Premium UI setters
  setActiveNav: (nav: NavTab) => void;
  setActiveSidebar: (sidebar: SidebarTab) => void;
  setActiveFile: (filename: string) => void;
  setFileContent: (filename: string, content: string) => void;
  setIsWaveformModalOpen: (open: boolean) => void;
  setIsFsmFixing: (fixing: boolean) => void;
  setFsmFixState: (state: "idle" | "streaming" | "ready") => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  rtl: FILE_ALU,
  activeMode: "debug",
  result: null,
  isLoading: false,
  error: null,
  waveformFile: null,
  waveformContext: "Expected alu_out to follow data_a + data_b on posedge clk without truncation.",
  toasts: [],

  // Premium defaults
  activeNav: "workspace",
  activeSidebar: "copilot",
  activeFile: "alu.v",
  files: {
    "alu.v": FILE_ALU,
    "tb_alu.v": FILE_TB_ALU,
    "dma_controller_ai.sv": FILE_DMA,
    "uart_tx.v": FILE_UART,
  },
  isWaveformModalOpen: false,
  isFsmFixing: false,
  fsmFixState: "idle",

  setRtl: (rtl) => set((state) => {
    // Also keep the active file content sync'd
    const updatedFiles = { ...state.files, [state.activeFile]: rtl };
    return { rtl, files: updatedFiles };
  }),
  setActiveMode: (activeMode) => set({ activeMode }),
  setResult: (result) => set({ result }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setWaveformFile: (waveformFile) => set({ waveformFile }),
  setWaveformContext: (waveformContext) => set({ waveformContext }),
  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Premium setters
  setActiveNav: (activeNav) => set({ activeNav }),
  setActiveSidebar: (activeSidebar) => set({ activeSidebar }),
  setActiveFile: (activeFile) => set((state) => ({
    activeFile,
    rtl: state.files[activeFile] || "",
  })),
  setFileContent: (filename, content) => set((state) => {
    const updatedFiles = { ...state.files, [filename]: content };
    return {
      files: updatedFiles,
      rtl: state.activeFile === filename ? content : state.rtl,
    };
  }),
  setIsWaveformModalOpen: (isWaveformModalOpen) => set({ isWaveformModalOpen }),
  setIsFsmFixing: (isFsmFixing) => set({ isFsmFixing }),
  setFsmFixState: (fsmFixState) => set({ fsmFixState }),
}));
