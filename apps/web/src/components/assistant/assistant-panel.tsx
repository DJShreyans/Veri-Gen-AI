"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Bot, CircuitBoard, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { chatWithAssistant, debugRtl, generateTestbench } from "@/lib/api-client";

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

export function AssistantPanel() {
  const activeMode = useWorkspaceStore((state) => state.activeMode);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const rtl = useWorkspaceStore((state) => state.rtl);
  const addToast = useWorkspaceStore((state) => state.addToast);
  const setLoading = useWorkspaceStore((state) => state.setLoading);
  const setError = useWorkspaceStore((state) => state.setError);
  const setResult = useWorkspaceStore((state) => state.setResult);
  const setActiveMode = useWorkspaceStore((state) => state.setActiveMode);
  const activeSidebar = useWorkspaceStore((state) => state.activeSidebar);
  const files = useWorkspaceStore((state) => state.files);
  const setActiveFile = useWorkspaceStore((state) => state.setActiveFile);

  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "I noticed a potential logic issue in alu.v around line 12. Want me to suggest a width-explicit fix?"
    }
  ]);

  const statusText = useMemo(() => {
    if (isLoading || isSending) return "Running hardware workflow...";
    if (activeMode === "debug") return "Ready for RTL debug";
    if (activeMode === "testbench") return "Ready for testbench generation";
    if (activeMode === "codex") return "Ready for Codex fix";
    return "Ready for waveform context";
  }, [activeMode, isLoading, isSending]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;
    
    const updatedMessages = [...messages, { role: "user" as const, text }];
    setMessages(updatedMessages);
    setDraft("");
    setIsSending(true);
    
    try {
      const response = await chatWithAssistant(rtl, text, messages);
      setMessages((current) => [...current, { role: "assistant" as const, text: response.response }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get response from assistant";
      addToast(msg, "error");
      setMessages((current) => [...current, { role: "assistant" as const, text: `⚠️ Error: ${msg}` }]);
    } finally {
      setIsSending(false);
    }
  }

  async function triggerQuickAction(mode: "debug" | "testbench") {
    setActiveMode(mode);
    setLoading(true);
    setError(null);
    addToast(`Triggering AI ${mode} workflow...`, "info");
    try {
      if (mode === "debug") {
        const data = await debugRtl(rtl);
        setResult({ mode, data });
        addToast("RTL debugging analysis complete", "success");
      } else {
        const data = await generateTestbench(rtl);
        setResult({ mode, data });
        addToast("Testbench generated successfully", "success");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Request failed";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  // Render Explorer File List if activeSidebar is "explorer"
  if (activeSidebar === "explorer") {
    return (
      <aside className="flex min-h-0 w-full flex-col bg-panel lg:w-[300px] border-r border-line select-none">
        <div className="border-b border-line p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Explorer</p>
          <p className="text-xs text-muted">Active Design Workspace</p>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-1">
          {Object.keys(files).map((filename) => (
            <button
              key={filename}
              onClick={() => setActiveFile(filename)}
              className={`w-full flex items-center gap-2 rounded px-3 py-2 text-xs font-mono transition text-left ${
                useWorkspaceStore.getState().activeFile === filename
                  ? "bg-cyan/10 text-cyan border border-cyan/20"
                  : "text-muted hover:bg-surface/50 hover:text-ink"
              }`}
            >
              <CircuitBoard className="h-4 w-4" />
              {filename}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex min-h-0 w-full flex-col bg-panel lg:w-[300px] border-r border-line">
      {/* Panel Title */}
      <div className="border-b border-line p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10">
            <Bot className="h-5 w-5 text-cyan" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">AI Assistant</p>
            <p className="text-xs text-muted">{statusText}</p>
          </div>
        </div>
      </div>

      {/* Messages view */}
      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 flex flex-col">
        {messages.map((message, index) => {
          const isAssistant = message.role === "assistant";
          const Icon = isAssistant ? Bot : UserRound;
          return (
            <div key={`${message.role}-${index}`} className="flex gap-2.5">
              <div
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                  isAssistant ? "border-cyan/25 bg-cyan/10 animate-pulse" : "border-line bg-[#10131b]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isAssistant ? "text-cyan" : "text-muted"}`} />
              </div>
              <div className={`flex-1 rounded-md border border-line p-3 text-xs leading-5 ${isAssistant ? "bg-surface text-ink" : "bg-[#10131b] text-muted"}`}>
                <p>{message.text}</p>
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex gap-2.5 animate-pulse">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-cyan/25 bg-cyan/10">
              <Bot className="h-3.5 w-3.5 text-cyan" />
            </div>
            <div className="flex-1 rounded-md border border-line p-3 bg-surface text-xs leading-5">
              <p className="text-cyan font-medium">Thinking...</p>
            </div>
          </div>
        )}

        <Separator className="my-2" />

        {/* Quick action chips */}
        <div className="space-y-2 mt-auto">
          <button
            onClick={() => triggerQuickAction("debug")}
            disabled={isLoading || isSending}
            className="w-full text-left text-xs bg-surface hover:bg-[#151923] border border-line/60 rounded p-2.5 text-muted hover:text-cyan transition"
          >
            &quot;Debug this RTL&quot;
          </button>
          <button
            onClick={() => triggerQuickAction("testbench")}
            disabled={isLoading || isSending}
            className="w-full text-left text-xs bg-surface hover:bg-[#151923] border border-line/60 rounded p-2.5 text-muted hover:text-cyan transition"
          >
            &quot;Generate testbench&quot;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="rounded border border-line bg-[#10131b] p-2.5 text-center">
            <CircuitBoard className="mx-auto mb-1 h-3.5 w-3.5 text-green" />
            <p className="text-[10px] font-medium text-ink">RTL-aware</p>
          </div>
          <div className="rounded border border-line bg-[#10131b] p-2.5 text-center">
            <Sparkles className="mx-auto mb-1 h-3.5 w-3.5 text-cyan" />
            <p className="text-[10px] font-medium text-ink">Codex-ready</p>
          </div>
        </div>
      </div>

      {/* Input container */}
      <div className="border-t border-line p-3">
        <form onSubmit={submitMessage} className="flex items-center gap-2 rounded-md border border-line bg-[#0d1017] p-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-8 border-transparent bg-transparent px-1 focus:border-transparent text-xs"
            placeholder="Ask AI..."
          />
          <Button className="min-h-8 px-2 py-1 hover:text-cyan" variant="ghost" aria-label="Send message" type="submit">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
