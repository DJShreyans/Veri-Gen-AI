"use client";

import { Bug, Cpu, Loader2, ScanLine, Wrench } from "lucide-react";
import { analyzeWaveform, codexFix, debugRtl, generateTestbench } from "@/lib/api-client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Button } from "@/components/ui/button";
import { WaveformUpload } from "@/components/upload/waveform-upload";

export function ActionBar() {
  const rtl = useWorkspaceStore((state) => state.rtl);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const activeMode = useWorkspaceStore((state) => state.activeMode);
  const setLoading = useWorkspaceStore((state) => state.setLoading);
  const setError = useWorkspaceStore((state) => state.setError);
  const setResult = useWorkspaceStore((state) => state.setResult);
  const setActiveMode = useWorkspaceStore((state) => state.setActiveMode);
  const waveformFile = useWorkspaceStore((state) => state.waveformFile);
  const waveformContext = useWorkspaceStore((state) => state.waveformContext);
  const addToast = useWorkspaceStore((state) => state.addToast);

  async function runAction(mode: "debug" | "testbench" | "codex" | "waveform") {
    setActiveMode(mode);
    setLoading(true);
    setError(null);
    try {
      if (mode === "debug") {
        const data = await debugRtl(rtl);
        setResult({ mode, data });
        addToast("RTL debugging analysis complete", "success");
      }
      if (mode === "testbench") {
        const data = await generateTestbench(rtl);
        setResult({ mode, data });
        addToast("Testbench generated successfully", "success");
      }
      if (mode === "codex") {
        const data = await codexFix(rtl);
        setResult({ mode, data });
        addToast("Codex Fix applied successfully", "success");
      }
      if (mode === "waveform") {
        if (!waveformFile) {
          throw new Error("Please upload a waveform screenshot first.");
        }
        const data = await analyzeWaveform(waveformFile, rtl, waveformContext);
        setResult({ mode, data });
        addToast("Waveform analysis complete", "success");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected request failure";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-[#0d1017] px-4 py-3">
      <WaveformUpload />
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button disabled={isLoading} variant="primary" onClick={() => runAction("debug")}>
          {isLoading && activeMode === "debug" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
          Debug RTL
        </Button>
        <Button disabled={isLoading} onClick={() => runAction("testbench")}>
          {isLoading && activeMode === "testbench" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
          Generate Testbench
        </Button>
        <Button disabled={isLoading} variant="danger" onClick={() => runAction("codex")}>
          {isLoading && activeMode === "codex" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
          Fix with Codex
        </Button>
        {waveformFile && (
          <Button disabled={isLoading} variant="primary" className="bg-[#0f172a] text-cyan hover:bg-[#1e293b] border-cyan/40" onClick={() => runAction("waveform")}>
            {isLoading && activeMode === "waveform" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
            Analyze Waveform
          </Button>
        )}
      </div>
    </div>
  );
}
