"use client";

import { CheckCircle2, Clipboard, AlertTriangle, Info, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Severity, ValidationResult } from "@/types/api";

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === "error") return <AlertTriangle className="h-4 w-4 text-[#ff8a9a]" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-amber" />;
  return <Info className="h-4 w-4 text-cyan" />;
}

function ValidationBadge({ validation }: { validation: ValidationResult }) {
  const isPassed = validation.status === "passed";
  const isFailed = validation.status === "failed";
  const badgeClass = isFailed
    ? "border-[#ff8a9a]/30 bg-[#2a1720] text-[#ff8a9a]"
    : !isPassed
    ? "border-amber/30 bg-amber/10 text-amber"
    : "";

  return (
    <Badge variant={isPassed ? "success" : "default"} className={`gap-2 ${badgeClass}`}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      {validation.tool}: {validation.status}
    </Badge>
  );
}

function CodeBlock({ code, label, onApply }: { code: string; label: string; onApply?: () => void }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-[#090b10]">
      <div className="flex items-center justify-between border-b border-line px-3 py-2 bg-[#090b10]/40">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{label}</span>
        <div className="flex items-center gap-1.5">
          {onApply && (
            <button
              onClick={onApply}
              className="inline-flex h-7 items-center justify-center rounded border border-line bg-surface/80 px-3 text-[10px] font-semibold text-cyan hover:bg-[#151923] transition select-none"
            >
              Apply Fix
            </button>
          )}
          <Button variant="ghost" className="min-h-8 px-2 py-1" onClick={() => navigator.clipboard.writeText(code)} title="Copy code">
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <pre className="max-h-[280px] overflow-auto p-3 text-xs leading-5 text-[#c7d2fe] font-mono">{code}</pre>
    </div>
  );
}

// Custom code diff component mapping old vs new lines
function DiffBlock({ original, corrected }: { original: string; corrected: string }) {
  const origLines = original.split("\n");
  const corrLines = corrected.split("\n");
  
  // Find first different line
  let firstDiff = -1;
  for (let i = 0; i < Math.min(origLines.length, corrLines.length); i++) {
    if (origLines[i].trim() !== corrLines[i].trim()) {
      firstDiff = i;
      break;
    }
  }

  if (firstDiff === -1) {
    return (
      <div className="rounded-md border border-line bg-[#090b10] p-3 text-xs font-mono text-muted text-center">
        No modifications needed in this segment.
      </div>
    );
  }

  const prevLine = firstDiff > 0 ? origLines[firstDiff - 1] : "";
  const oldLine = origLines[firstDiff];
  const newLine = corrLines[firstDiff];
  const nextLine = firstDiff < origLines.length - 1 ? origLines[firstDiff + 1] : "";

  return (
    <div className="overflow-hidden rounded-md border border-line bg-[#07090d] text-xs font-mono">
      <div className="border-b border-line px-3 py-1.5 bg-[#090b10]/40 text-[10px] text-muted uppercase tracking-wider">
        RTL Code Comparison
      </div>
      <div className="p-2 space-y-1">
        {prevLine && (
          <div className="text-muted/60 pl-4 truncate">{prevLine}</div>
        )}
        <div className="bg-[#2a1720] text-[#ffb4c1] border-l-2 border-[#ff8a9a] pl-2 py-0.5 select-text overflow-x-auto whitespace-pre">
          - {oldLine}
        </div>
        <div className="bg-green/5 text-green border-l-2 border-green pl-2 py-0.5 select-text overflow-x-auto whitespace-pre">
          + {newLine}
        </div>
        {nextLine && (
          <div className="text-muted/60 pl-4 truncate">{nextLine}</div>
        )}
      </div>
    </div>
  );
}

export function OutputPanel() {
  const result = useWorkspaceStore((state) => state.result);
  const error = useWorkspaceStore((state) => state.error);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const rtl = useWorkspaceStore((state) => state.rtl);
  const setRtl = useWorkspaceStore((state) => state.setRtl);
  const addToast = useWorkspaceStore((state) => state.addToast);

  const defaultCorrectedAluCode = `module alu (
  input wire clk,
  input wire rst,
  input wire [31:0] data_a,
  input wire [31:0] data_b,
  output reg [31:0] alu_out,
  output reg carry // Added overflow bit
);

always @(posedge clk) begin
  if (rst) begin
    alu_out <= 32'b0;
    carry   <= 1'b0;
  end else begin
    {carry, alu_out} <= data_a + data_b; // Overflow handled
  end
end

endmodule`;

  function applyDefaultFix() {
    setRtl(defaultCorrectedAluCode);
    addToast("Applied bit-width carry truncation fix to alu.v", "success");
  }

  return (
    <aside className="flex min-h-0 w-full flex-col bg-panel lg:w-[320px] select-none">
      {/* Title */}
      <div className="border-b border-line p-4">
        <p className="text-sm font-semibold text-ink">Analysis</p>
        <p className="text-xs text-muted font-medium">Linter logs, errors, and corrected diffs</p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 flex flex-col justify-start">
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="rounded-md border border-cyan/20 bg-cyan/10 p-3 text-xs text-cyan animate-pulse">
            Verifying syntax and compilation stages...
          </div>
        )}

        {/* Backend errors */}
        {error && (
          <div className="rounded-md border border-[#ff8a9a]/30 bg-[#2a1720] p-3 text-xs text-[#ffb4c1]">
            {error}
          </div>
        )}

        {/* DEFAULT STATE: MATCHES SCREENSHOT 2 */}
        {!result && !error && !isLoading && (
          <div className="space-y-4 flex-1 flex flex-col justify-start">
            
            {/* Logic Error Card */}
            <div className="rounded-md border border-line bg-surface p-4 flex flex-col gap-3 shadow-glow">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#2a1720] flex items-center justify-center border border-[#ff8a9a]/20">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#ff8a9a]" />
                </div>
                <h3 className="text-xs font-bold text-ink">Logic Error Detected</h3>
              </div>
              <p className="text-xs leading-5 text-muted">
                Line 12: Adding two 32-bit registers without an overflow bit may result in truncation.
              </p>

              {/* Code comparison diff */}
              <div className="overflow-hidden rounded border border-line bg-[#07090d] text-[10px] font-mono select-text p-2 space-y-1">
                <div className="bg-[#2a1720] text-[#ffb4c1] border-l-2 border-[#ff8a9a] pl-2">
                  - alu_out &lt;= data_a + data_b;
                </div>
                <div className="bg-green/5 text-green border-l-2 border-green pl-2">
                  + &#123;carry, alu_out&#125; &lt;= data_a + data_b;
                </div>
              </div>

              {/* Apply Fix trigger */}
              <button
                onClick={applyDefaultFix}
                className="w-full inline-flex min-h-8 items-center justify-center rounded bg-cyan/10 text-cyan border border-cyan/30 text-xs font-semibold hover:bg-cyan hover:text-[#071015] active:scale-[0.98] transition"
              >
                Apply Fix
              </button>
            </div>

          </div>
        )}

        {/* Real Backend /debug-rtl response */}
        {result?.mode === "debug" && (
          <div className="space-y-4">
            <p className="text-xs leading-5 text-muted">{result.data.summary}</p>
            <div className="flex gap-2">
              <ValidationBadge validation={result.data.input_validation} />
              <ValidationBadge validation={result.data.validation} />
            </div>

            {/* Render dynamically discovered issues */}
            <div className="space-y-2">
              {result.data.issues.map((issue, idx) => (
                <div key={idx} className="rounded border border-line bg-surface p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <SeverityIcon severity={issue.severity} />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-ink">
                        {issue.category} {issue.line ? `(Line ${issue.line})` : ""}
                      </p>
                      <p className="text-xs text-muted mt-1 leading-5">{issue.message}</p>
                      {issue.suggestion && (
                        <p className="text-[11px] text-cyan mt-1 leading-4">{issue.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DiffBlock original={rtl} corrected={result.data.corrected_code} />

            <button
              onClick={() => {
                setRtl(result.data.corrected_code);
                addToast("Corrected RTL applied to editor", "success");
              }}
              className="w-full inline-flex min-h-9 items-center justify-center rounded bg-cyan text-[#071015] text-xs font-semibold hover:bg-white transition"
            >
              Apply Corrected RTL
            </button>
          </div>
        )}

        {/* Real Backend /generate-testbench response */}
        {result?.mode === "testbench" && (
          <div className="space-y-4">
            <p className="text-xs leading-5 text-muted">{result.data.summary}</p>
            <ValidationBadge validation={result.data.validation} />
            <CodeBlock
              label="Generated Testbench"
              code={result.data.testbench}
              onApply={() => {
                setRtl(result.data.testbench);
                addToast("Testbench applied to editor", "success");
              }}
            />
          </div>
        )}

        {/* Real Backend /codex-fix response */}
        {result?.mode === "codex" && (
          <div className="space-y-4">
            <p className="text-xs leading-5 text-muted">{result.data.summary}</p>
            <ValidationBadge validation={result.data.validation} />
            
            <DiffBlock original={rtl} corrected={result.data.fixed_code} />

            <button
              onClick={() => {
                setRtl(result.data.fixed_code);
                addToast("Applied Codex fix code to editor", "success");
              }}
              className="w-full inline-flex min-h-9 items-center justify-center rounded bg-cyan text-[#071015] text-xs font-semibold hover:bg-white transition"
            >
              Apply Codex Fix
            </button>
          </div>
        )}

        {/* Real compile logs from validation status */}
        {result && "validation" in result.data && result.data.validation.logs && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
              <Terminal className="h-3.5 w-3.5 text-amber" />
              <span>Compiler Logs</span>
            </div>
            <pre className="p-3 border border-line bg-black rounded text-[10px] leading-4 font-mono text-muted select-text max-h-[140px] overflow-auto">
              {result.data.validation.logs}
            </pre>
          </div>
        )}

      </div>
    </aside>
  );
}
