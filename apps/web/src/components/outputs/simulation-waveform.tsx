"use client";

import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

export function SimulationWaveform() {
  const [zoom, setZoom] = useState(1);

  // Digital SVG pulse paths
  // Clock: fast transitions
  // Rst: high at first, then low
  // Data_in: stable transitions
  // Alu_out: following transitions

  return (
    <div className="border-t border-line bg-[#090b10] px-4 py-3">
      <div className="flex items-center justify-between border-b border-line/40 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">tb_alu Simulation</p>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.15))}
            className="rounded p-1 hover:bg-line hover:text-cyan transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium px-1 select-none">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2.0, zoom + 0.15))}
            className="rounded p-1 hover:bg-line hover:text-cyan transition"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[120px_1fr] border border-line/30 rounded-md bg-[#07090d] min-h-[140px] overflow-hidden">
        {/* Signal Names Column */}
        <div className="border-r border-line/30 bg-[#090b10]/40 flex flex-col justify-around py-2 text-xs font-mono text-muted select-none">
          <div className="px-3 py-1 border-l-2 border-cyan text-ink bg-cyan/5">clk</div>
          <div className="px-3 py-1 border-l-2 border-transparent">rst</div>
          <div className="px-3 py-1 border-l-2 border-transparent text-[#94a3b8]">data_in</div>
          <div className="px-3 py-1 border-l-2 border-transparent text-green">alu_out</div>
        </div>

        {/* Waveform Timeline Graphic */}
        <div className="relative overflow-x-auto overflow-y-hidden py-2 select-none verigen-grid">
          <div
            className="h-full min-w-[600px] flex flex-col justify-around relative transition-all duration-300"
            style={{ transform: `scaleX(${zoom})`, transformOrigin: "left center" }}
          >
            {/* Clock Signal Graph */}
            <div className="h-8 flex items-center">
              <svg className="w-full h-6 stroke-cyan stroke-[1.5] fill-none">
                <path d="M 0,16 L 30,16 L 30,2 L 60,2 L 60,16 L 90,16 L 90,2 L 120,2 L 120,16 L 150,16 L 150,2 L 180,2 L 180,16 L 210,16 L 210,2 L 240,2 L 240,16 L 270,16 L 270,2 L 300,2 L 300,16 L 330,16 L 330,2 L 360,2 L 360,16 L 390,16 L 390,2 L 420,2 L 420,16 L 450,16 L 450,2 L 480,2 L 480,16 L 510,16 L 510,2 L 540,2 L 540,16 L 570,16 L 570,2 L 600,2" />
              </svg>
            </div>

            {/* Reset Signal Graph */}
            <div className="h-8 flex items-center">
              <svg className="w-full h-6 stroke-amber stroke-[1.5] fill-none">
                <path d="M 0,2 L 80,2 L 80,16 L 600,16" />
              </svg>
            </div>

            {/* Data_In Signal (hex bus) Graph */}
            <div className="h-8 flex items-center">
              <svg className="w-full h-6 stroke-slate-400 stroke-[1.5] fill-none">
                {/* Hex shape buses */}
                <path d="M 0,9 L 10,2 L 110,2 L 120,9 L 110,16 L 10,16 Z" />
                <text x="25" y="13" className="fill-[#94a3b8] text-[9px] font-mono stroke-none">{"32'h0000000A"}</text>
                
                <path d="M 120,9 L 130,2 L 270,2 L 280,9 L 270,16 L 130,16 Z" />
                <text x="145" y="13" className="fill-[#94a3b8] text-[9px] font-mono stroke-none">{"32'h00000014"}</text>
                
                <path d="M 280,9 L 290,2 L 450,2 L 460,9 L 450,16 L 290,16 Z" />
                <text x="310" y="13" className="fill-[#94a3b8] text-[9px] font-mono stroke-none">{"32'h0000001E"}</text>

                <path d="M 460,9 L 470,2 L 600,2 M 460,9 L 470,16 L 600,16" />
              </svg>
            </div>

            {/* Alu_Out Signal Graph */}
            <div className="h-8 flex items-center">
              <svg className="w-full h-6 stroke-green stroke-[1.5] fill-none">
                {/* Delayed output following clock and data */}
                <path d="M 0,16 L 90,16 L 90,9 M 90,9 L 100,2 L 210,2 L 220,9 L 210,16 L 100,16 Z" />
                <text x="125" y="13" className="fill-green text-[9px] font-mono stroke-none">{"32'h0000000A"}</text>

                <path d="M 220,9 L 230,2 L 330,2 L 340,9 L 330,16 L 230,16 Z" />
                <text x="250" y="13" className="fill-green text-[9px] font-mono stroke-none">{"32'h0000001E"}</text>

                <path d="M 340,9 L 350,2 L 600,2 M 340,9 L 350,16 L 600,16" />
              </svg>
            </div>

            {/* Vertical Marker Line */}
            <div className="absolute left-[165px] top-0 bottom-0 w-[1px] bg-red-500/60 pointer-events-none">
              <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full border border-black" />
              <span className="absolute top-2 left-2 text-[9px] font-semibold text-red-400 bg-black/80 px-1 py-0.5 rounded border border-red-500/20">
                165.0ns
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
