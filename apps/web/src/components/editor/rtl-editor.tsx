"use client";

import dynamic from "next/dynamic";
import { Code2, Cpu, FileCode2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/stores/workspace-store";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-muted">Loading RTL editor...</div>
});

export function RtlEditor() {
  const rtl = useWorkspaceStore((state) => state.rtl);
  const setRtl = useWorkspaceStore((state) => state.setRtl);
  const files = useWorkspaceStore((state) => state.files);
  const activeFile = useWorkspaceStore((state) => state.activeFile);
  const setActiveFile = useWorkspaceStore((state) => state.setActiveFile);
  const result = useWorkspaceStore((state) => state.result);

  // Compile status dynamically updates based on validation logs
  const status = result?.data && "validation" in result.data ? result.data.validation.status : "passed";

  return (
    <div className="flex min-h-0 flex-1 flex-col border-x border-line bg-[#0b0d12]">
      
      {/* Dynamic File Tab Bar */}
      <div className="flex h-12 items-center justify-between border-b border-line bg-[#0d1017] px-2 select-none shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {Object.keys(files).map((filename) => {
            const isActive = activeFile === filename;
            return (
              <button
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded border transition ${
                  isActive
                    ? "bg-[#171a23] text-cyan border-line border-b-transparent"
                    : "text-muted border-transparent hover:bg-surface/50 hover:text-ink"
                }`}
              >
                <FileCode2 className={`h-3.5 w-3.5 ${isActive ? "text-cyan" : "text-muted"}`} />
                {filename}
              </button>
            );
          })}
        </div>

        {/* Compiled Status Indicator */}
        <div className="px-2">
          {status === "passed" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green/30 bg-green/10 px-2.5 py-0.5 text-[10px] font-medium text-green select-none">
              <span className="h-1 w-1 rounded-full bg-green" />
              Compiled
            </span>
          )}
          {status === "failed" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff8a9a]/30 bg-[#2a1720] px-2.5 py-0.5 text-[10px] font-medium text-[#ff8a9a] select-none animate-pulse">
              <span className="h-1 w-1 rounded-full bg-red-500" />
              Compile Failed
            </span>
          )}
          {status === "skipped" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/10 px-2.5 py-0.5 text-[10px] font-medium text-amber select-none">
              <span className="h-1 w-1 rounded-full bg-amber" />
              Linter Skipped
            </span>
          )}
        </div>
      </div>

      {/* Monaco Editor Canvas */}
      <div className="min-h-0 flex-1">
        <MonacoEditor
          height="100%"
          language="verilog"
          value={rtl}
          onChange={(value) => setRtl(value ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "JetBrains Mono, Consolas, monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            }
          }}
        />
      </div>
    </div>
  );
}
