"use client";

import { useEffect, useState } from "react";
import { ImageUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function WaveformUpload() {
  const waveformFile = useWorkspaceStore((state) => state.waveformFile);
  const waveformContext = useWorkspaceStore((state) => state.waveformContext);
  const setWaveformFile = useWorkspaceStore((state) => state.setWaveformFile);
  const setWaveformContext = useWorkspaceStore((state) => state.setWaveformContext);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!waveformFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(waveformFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [waveformFile]);

  return (
    <div className="flex min-w-[280px] flex-1 flex-wrap items-center gap-3">
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink transition hover:border-cyan/50">
        <ImageUp className="h-4 w-4 text-cyan" />
        {waveformFile ? "Change Waveform" : "Upload Waveform"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => setWaveformFile(event.target.files?.[0] ?? null)}
        />
      </label>

      {waveformFile ? (
        <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-1.5 h-10">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Waveform preview"
              className="h-6 w-9 rounded border border-line/60 object-cover bg-black"
            />
          )}
          <span className="max-w-[120px] truncate text-xs text-ink font-medium">
            {waveformFile.name}
          </span>
          <button
            type="button"
            onClick={() => setWaveformFile(null)}
            className="flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-line hover:text-[#ff8a9a] transition ml-1"
            title="Remove waveform"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      <Input
        value={waveformContext}
        onChange={(event) => setWaveformContext(event.target.value)}
        className="min-w-[220px] flex-1 h-10"
        placeholder="Expected waveform behavior (e.g. expected q to follow d on clk edge)"
      />
    </div>
  );
}
