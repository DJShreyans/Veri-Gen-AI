"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export function Toaster() {
  const toasts = useWorkspaceStore((state) => state.toasts);
  const removeToast = useWorkspaceStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-md border border-line bg-surface/90 backdrop-blur-md p-3.5 shadow-glow animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all ${
              isError
                ? "border-[#ff8a9a]/20 bg-[#2a1720]/80"
                : isSuccess
                  ? "border-[#74f2a7]/20 bg-[#0e1f18]/80"
                  : "border-line bg-surface/90"
            }`}
          >
            <div className="flex shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-4.5 w-4.5 text-green" />}
              {isError && <AlertTriangle className="h-4.5 w-4.5 text-[#ff8a9a]" />}
              {toast.type === "info" && <Info className="h-4.5 w-4.5 text-cyan" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink leading-5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted hover:text-ink shrink-0 p-0.5 rounded-full hover:bg-line transition ml-1"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
