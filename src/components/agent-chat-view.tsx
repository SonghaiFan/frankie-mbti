"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { mbtiTypes } from "@/data/core/mbti-data";
import sources from "@/data/claims/sources.json";
import { useMBTIStore } from "@/store/mbti-store";
import Portal from "./portal";
import { ThinkingVisual, StreamingCursor } from "./thinking-visual";
import type { CitedClaim } from "@/services/mbti-agent-service";

const SHELL = "mx-auto w-full max-w-[860px] px-4 sm:px-10";
const TYPE_CODES = mbtiTypes.map((t) => t.type);
const SOURCE_TITLE = new Map(sources.map((s) => [s.index, s.title]));
const easeSmoothOut = [0.22, 1, 0.36, 1] as const;

const citationBackdropVariants = {
  closed: { opacity: 0, transition: { duration: 0.15, ease: "linear" as const } },
  open: { opacity: 1, transition: { duration: 0.25, ease: "linear" as const } },
};

const citationModalVariants = {
  closed: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.15, ease: easeSmoothOut },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: easeSmoothOut },
  },
};

type Mode = "diagnose" | "consult";

interface ToolEvent {
  name: string;
  args?: Record<string, unknown>;
  status: "running" | "done";
  summary?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolEvents?: ToolEvent[];
  /** The model's <think> block, streamed separately from the reply. */
  thinking?: string;
  citations?: CitedClaim[];
  isStreaming?: boolean;
  engine?: "gemini" | "offline_graph";
  model?: string;
}

/** What a citation mark opens: the source, and the claims from it this reply used. */
interface CitationTarget {
  sourceIndex: number;
  title: string;
  claims: CitedClaim[];
}

const MODELS = [
  { id: "gemini-3.8-flash", label: "3.8 Flash" },
  { id: "gemini-flash-latest", label: "Flash Latest" },
  { id: "gemini-3.5-flash-lite", label: "3.5 Lite" },
  { id: "gemini-3.1-pro-preview", label: "3.1 Pro" },
];

const PRESET_DIAGNOSE = [
  "帮我测一下我的类型",
  "我分不清自己是 INFP 还是 INFJ",
  "INTJ 和 INTP 生活里怎么分辨",
  "我压力大的时候会失控，这是哪个功能在作怪",
];

const PRESET_CONSULT = [
  "INTJ 和 INFP 谈恋爱，最容易在哪里出问题",
  "INTP 在工作里拖延，只想不做，怎么办",
  "怎么跟强势的 ENTJ 上司沟通",
  "INFJ 内耗严重，怎么把 Se 用起来",
];

const WELCOME: Record<Mode, string> = {
  diagnose:
    "你好。这里帮你判断 MBTI 类型，方法是问你几个生活场景，一次一个。\n\n可以先告诉我你在纠结的类型，比如「INFP 还是 INFJ」，也可以直接说「帮我测一下」。",
  consult: "你好。这里接了 1,251 条作者原声观点和 136 组配对读法，回答会标注出处。\n\n说说你的情况：涉及哪些类型，具体发生了什么。",
};

const RESET: Record<Mode, string> = {
  diagnose: "对话已清空。告诉我你在纠结的类型，或者直接说「帮我测一下」。",
  consult: "对话已清空。说说你的情况：涉及哪些类型，具体发生了什么。",
};

const now = () => new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

export function AgentChatView() {
  const searchParams = useSearchParams();
  const initialMode: Mode = searchParams.get("mode") === "consult" ? "consult" : "diagnose";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.8-flash");
  const [showSettings, setShowSettings] = useState(false);
  const [pingState, setPingState] = useState<{
    testing: boolean;
    result?: { ok: boolean; model: string; latencyMs: number; error?: string };
  }>({ testing: false });
  const [openThinking, setOpenThinking] = useState<Record<string, boolean>>({});
  const [citation, setCitation] = useState<CitationTarget | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const setSelectedType = useMBTIStore((s) => s.setSelectedType);

  // Load local API key & model from storage
  useEffect(() => {
    const saved = localStorage.getItem("frank_mbti_gemini_key");
    if (saved) setCustomKey(saved);
    const savedModel = localStorage.getItem("frank_mbti_gemini_model");
    if (savedModel) setSelectedModel(savedModel);
  }, []);

  // Sync mode with URL param if present
  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "diagnose" || m === "consult") setMode(m);
  }, [searchParams]);

  // Greeting on first load or mode change
  useEffect(() => {
    setMessages([{ id: `welcome-${mode}`, role: "assistant", content: WELCOME[mode], timestamp: now() }]);
  }, [mode]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSaveKey = (val: string) => {
    setCustomKey(val);
    if (val.trim()) localStorage.setItem("frank_mbti_gemini_key", val.trim());
    else localStorage.removeItem("frank_mbti_gemini_key");
  };

  const handleSaveModel = (val: string) => {
    setSelectedModel(val);
    localStorage.setItem("frank_mbti_gemini_model", val);
  };

  const handlePingTest = async () => {
    setPingState({ testing: true });
    try {
      const params = new URLSearchParams();
      if (customKey.trim()) params.set("apiKey", customKey.trim());
      if (selectedModel) params.set("model", selectedModel);
      const res = await fetch(`/api/mbti/agent?${params.toString()}`);
      setPingState({ testing: false, result: await res.json() });
    } catch (err: unknown) {
      setPingState({
        testing: false,
        result: { ok: false, model: selectedModel, latencyMs: 0, error: err instanceof Error ? err.message : "网络请求异常" },
      });
    }
  };

  const handleClearMessages = () => {
    if (loading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
    setMessages([{ id: "msg-reset-" + Date.now(), role: "assistant", content: RESET[mode], timestamp: now() }]);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || loading) return;

    if (!overrideText) setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: Message = { id: "user-" + Date.now(), role: "user", content: textToSend, timestamp: now() };
    const assistantMsgId = "assistant-" + Date.now();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: now(),
      toolEvents: [],
      citations: [],
      isStreaming: true,
    };

    const newHistory = [...messages, userMsg];
    setMessages([...newHistory, assistantMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const patch = (fn: (msg: Message) => Message) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? fn(m) : m)));

    try {
      const response = await fetch("/api/mbti/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customKey ? { "x-gemini-api-key": customKey } : {}),
        },
        body: JSON.stringify({
          mode,
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          apiKey: customKey || undefined,
          model: selectedModel || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `请求失败 (${response.status})`);
      }
      if (!response.body) throw new Error("无返回流数据");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(trimmed.slice(6));
            patch((msg) => {
              switch (event.type) {
                case "engine":
                  return { ...msg, engine: event.engine, model: event.model };
                case "tool_call":
                  return {
                    ...msg,
                    toolEvents: [...(msg.toolEvents || []), { name: event.name, args: event.args, status: "running" }],
                  };
                case "tool_result": {
                  const existing = msg.toolEvents || [];
                  // Mark the oldest still-running call of this tool as done.
                  const idx = existing.findIndex((t) => t.name === event.name && t.status === "running");
                  if (idx < 0) return msg;
                  const next = existing.slice();
                  next[idx] = { ...next[idx], status: "done", summary: event.summary };
                  return { ...msg, toolEvents: next };
                }
                case "thought_delta":
                  return event.text ? { ...msg, thinking: (msg.thinking || "") + event.text } : msg;
                case "citation": {
                  if (!event.citation) return msg;
                  const existing = msg.citations || [];
                  if (existing.some((c) => c.id === event.citation.id)) return msg;
                  return { ...msg, citations: [...existing, event.citation] };
                }
                case "text_delta":
                  return event.text ? { ...msg, content: msg.content + event.text } : msg;
                case "done":
                  return { ...msg, isStreaming: false };
                case "error":
                  return { ...msg, content: msg.content + `\n\n> ${event.message}`, isStreaming: false };
                default:
                  return msg;
              }
            });
          } catch {
            // Ignore parse errors on trailing deltas
          }
        }
      }
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      const errMsg = err instanceof Error ? err.message : "网络或服务异常";
      patch((m) => ({
        ...m,
        content: m.content + (isAbort ? "\n\n*(已停止)*" : `\n\n> 请求失败：${errMsg}。可以在设置里配置 Gemini API Key，或检查网络。`),
        isStreaming: false,
      }));
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => abortControllerRef.current?.abort();

  const openTypeModal = (typeCode: string) => {
    const t = mbtiTypes.find((x) => x.type === typeCode.toUpperCase());
    if (t) setSelectedType(t);
  };

  /** Resolve a `[#130 …]` or `[#c028-06 …]` mark against this message's citations. */
  const openCitation = (mark: string, msg: Message) => {
    const body = mark.slice(2, -1).trim(); // drop "[#" and "]"
    const key = body.split(/\s+/)[0];
    const cited = msg.citations || [];
    let sourceIndex = Number(key);
    if (!Number.isFinite(sourceIndex)) {
      const byId = cited.find((c) => c.id === key);
      if (!byId) return;
      sourceIndex = byId.sourceIndex;
    }
    setCitation({
      sourceIndex,
      title: SOURCE_TITLE.get(sourceIndex) ?? body.slice(key.length).trim(),
      claims: cited.filter((c) => c.sourceIndex === sourceIndex),
    });
  };

  const fresh = messages.length <= 1;

  return (
    <div className="flex h-full min-h-0 flex-col bg-paper text-ink">
      {/* Mode row: plain words, the active one carries a hairline. */}
      <div className={cn(SHELL, "rule-b flex items-center justify-between gap-6 py-3 sm:py-4")}>
        <nav className="flex items-center gap-6 sm:gap-8" aria-label="模式">
          {(
            [
              ["diagnose", "推导类型"],
              ["consult", "图谱答疑"],
            ] as const
          ).map(([value, label]) => {
            const isActive = mode === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={isActive}
                className={cn(
                  "relative py-0.5 text-[0.8125rem] transition-colors duration-150 sm:text-[0.9375rem]",
                  isActive ? "text-ink" : "text-ink-ghost hover:text-ink-soft"
                )}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="agent-mode-tab"
                    className="absolute inset-x-0 -bottom-1 block h-px bg-ink"
                    transition={{ duration: 0.25, ease: easeSmoothOut }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-5 text-[0.75rem] sm:text-[0.8125rem]">
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className={cn("transition-colors duration-150", showSettings || customKey ? "text-ink" : "text-ink-faint hover:text-ink")}
          >
            设置
          </button>
          <button type="button" onClick={handleClearMessages} className="text-ink-faint transition-colors duration-150 hover:text-ink">
            清空
          </button>
        </div>
      </div>

      {/* Settings: key, model, a connectivity check. */}
      <AnimatePresence initial={false}>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easeSmoothOut }}
            className="overflow-hidden"
          >
            <div className={cn(SHELL, "rule-b space-y-3 py-4")}>
              <div className="flex items-baseline gap-4 sm:gap-8">
                <span className="eyebrow w-14 shrink-0 text-[0.625rem] sm:w-20 sm:text-[0.6875rem]">Key</span>
                <input
                  type="password"
                  placeholder="GEMINI_API_KEY，留空则用服务端配置"
                  value={customKey}
                  onChange={(e) => handleSaveKey(e.target.value)}
                  className="rule-b min-w-0 flex-1 bg-transparent py-1 font-mono text-[0.75rem] text-ink placeholder:text-ink-ghost focus:border-ink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handlePingTest}
                  disabled={pingState.testing}
                  className="shrink-0 text-[0.75rem] text-ink-soft transition-colors hover:text-ink disabled:text-ink-ghost"
                >
                  {pingState.testing ? "测试中" : "测试"}
                </button>
              </div>

              <div className="flex items-baseline gap-4 sm:gap-8">
                <span className="eyebrow w-14 shrink-0 text-[0.625rem] sm:w-20 sm:text-[0.6875rem]">模型</span>
                <div className="scroll-quiet flex min-w-0 flex-1 gap-5 overflow-x-auto">
                  {MODELS.map((m) => {
                    const isActive = selectedModel === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSaveModel(m.id)}
                        aria-pressed={isActive}
                        className={cn(
                          "relative shrink-0 whitespace-nowrap py-0.5 text-[0.75rem] transition-colors",
                          isActive ? "text-ink" : "text-ink-ghost hover:text-ink-soft"
                        )}
                      >
                        {m.label}
                        {isActive && <span className="absolute inset-x-0 -bottom-0.5 block h-px bg-ink" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {pingState.result && (
                <p className="pl-[4.5rem] font-mono text-[0.6875rem] text-ink-faint sm:pl-[7rem]">
                  {pingState.result.ok
                    ? `${pingState.result.model} · ${pingState.result.latencyMs}ms`
                    : `连接失败 · ${pingState.result.error || "未知错误"}`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={cn(SHELL, "space-y-8 py-6 sm:space-y-10 sm:py-10")}>
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex flex-col items-end gap-1.5">
                <span className="eyebrow text-[0.625rem]">你 · {m.timestamp}</span>
                <p className="max-w-[80%] whitespace-pre-wrap text-right text-[0.9375rem] leading-[1.8] text-ink-soft">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex flex-col gap-2">
                <span className="eyebrow text-[0.625rem]">
                  Frank · {m.timestamp}
                  {m.engine === "offline_graph" && " · 本地图谱"}
                </span>

                {((m.toolEvents && m.toolEvents.length > 0) || m.thinking || m.isStreaming) && (
                  <ThinkingVisual
                    toolEvents={m.toolEvents || []}
                    thinking={m.thinking}
                    streaming={!!m.isStreaming}
                    open={!!openThinking[m.id]}
                    onToggle={() => setOpenThinking((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
                  />
                )}

                {m.content ? (
                  <MarkdownRenderer
                    content={m.content}
                    isStreaming={!!m.isStreaming}
                    onTypeClick={openTypeModal}
                    onCitationClick={(mark) => openCitation(mark, m)}
                  />
                ) : null}
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className={cn(SHELL, "rule-t pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-4 sm:pb-6")}>
        {fresh && (
          <div className="scroll-quiet mb-3 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="eyebrow text-[0.625rem] shrink-0 text-ink-faint mr-1">推荐问答:</span>
            {(mode === "diagnose" ? PRESET_DIAGNOSE : PRESET_CONSULT).map((q) => (
              <button
                key={q}
                type="button"
                disabled={loading}
                onClick={() => handleSend(q)}
                className="shrink-0 rounded-full border border-rule bg-paper px-3 py-1 text-[0.75rem] text-ink-soft transition-all hover:border-ink hover:text-ink active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Card Container */}
        <div className="relative rounded-xl border border-rule-strong bg-paper p-3 transition-all focus-within:border-ink focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-ink/50 sm:p-3.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            placeholder={mode === "diagnose" ? "回答上面的问题，或说说你在纠结的类型..." : "说说你的情况或两难场景..."}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[42px] w-full resize-none bg-transparent text-[0.9375rem] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
          />

          <div className="mt-2 flex items-center justify-between pt-2 rule-t">
            <span className="text-[0.6875rem] text-ink-faint">
              <span className="hidden sm:inline">Enter 发送 · Shift + Enter 换行 · </span>点击类型看档案
            </span>

            {loading ? (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex h-7 items-center gap-1.5 rounded border border-rule-strong bg-paper px-3 text-[0.75rem] font-medium text-ink transition-colors hover:bg-rule/40 active:scale-95"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>停止</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!input.trim()}
                onClick={() => handleSend()}
                className={cn(
                  "inline-flex h-7 items-center justify-center rounded px-3.5 text-[0.75rem] font-medium transition-all",
                  input.trim()
                    ? "bg-ink text-paper shadow-xs hover:opacity-90 active:scale-95 cursor-pointer"
                    : "bg-rule/60 text-ink-faint border border-rule cursor-not-allowed"
                )}
              >
                发送
              </button>
            )}
          </div>
        </div>
      </div>

      <CitationSheet target={citation} onClose={() => setCitation(null)} />
    </div>
  );
}



// ---------------------------------------------------------------------------
// Citation sheet: the source and the claims from it that the reply used
// ---------------------------------------------------------------------------

function CitationSheet({ target, onClose }: { target: CitationTarget | null; onClose: () => void }) {
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, onClose]);

  return (
    <Portal>
      <AnimatePresence>
        {target && (
          <>
            <motion.div
              variants={citationBackdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 z-[190] bg-ink/10 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              variants={citationModalVariants}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate="open"
              exit="closed"
              role="dialog"
              aria-modal
              aria-label={`来源 ${target.sourceIndex}`}
              className="fixed left-1/2 top-1/2 z-[200] max-h-[84dvh] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-paper px-6 py-6 shadow-[0_40px_120px_-48px_rgba(0,0,0,0.35)] sm:px-8 sm:py-8"
            >
              <button
                onClick={onClose}
                type="button"
                aria-label="关闭"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center text-ink-faint transition-colors duration-150 hover:text-ink"
              >
                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeWidth="1" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <span className="eyebrow font-mono text-[0.625rem]">#{String(target.sourceIndex).padStart(3, "0")}</span>
              <h3 className="mt-1.5 pr-8 text-[1.0625rem] font-medium leading-snug tracking-tight text-ink sm:text-[1.125rem]">
                {target.title}
              </h3>

              {target.claims.length > 0 ? (
                <div className="mt-4">
                  {target.claims.map((c) => (
                    <div key={c.id} className="rule-t py-3 sm:py-4">
                      {c.kind && <span className="eyebrow text-[0.625rem]">{c.kind}</span>}
                      <p className="mt-1 text-[0.875rem] leading-[1.8] text-ink">{c.statement}</p>
                      {c.advice && <p className="mt-1.5 text-[0.8125rem] leading-[1.7] text-ink-soft">→ {c.advice}</p>}
                      {c.boundary && <p className="mt-1 text-[0.8125rem] leading-[1.7] text-ink-faint">{c.boundary}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rule-t mt-4 pt-3 text-[0.8125rem] text-ink-faint">这条回答没有把这一专场的具体观点带回来。</p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}

// ---------------------------------------------------------------------------
// Markdown & MBTI Chip Renderer
// ---------------------------------------------------------------------------

interface InlineHandlers {
  onTypeClick: (type: string) => void;
  onCitationClick: (mark: string) => void;
}

function MarkdownRenderer({
  content,
  onTypeClick,
  onCitationClick,
  isStreaming = false,
}: {
  content: string;
  isStreaming?: boolean;
} & InlineHandlers) {
  const lines = content.split("\n");
  const h = { onTypeClick, onCitationClick };

  return (
    <div className="max-w-[72ch] space-y-2 text-[0.9375rem] leading-[1.85] text-ink">
      {lines.map((line, idx) => {
        const isLast = idx === lines.length - 1;
        const trimmed = line.trim();

        if (/^#{1,3} /.test(trimmed)) {
          return (
            <p key={idx} className="pt-2 font-medium tracking-tight">
              {renderInline(trimmed.replace(/^#{1,3} /, ""), h)}
              {isStreaming && isLast && <StreamingCursor />}
            </p>
          );
        }
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={idx} className="rule-l pl-3 text-[0.875rem] text-ink-soft">
              {renderInline(trimmed.slice(2), h)}
              {isStreaming && isLast && <StreamingCursor />}
            </blockquote>
          );
        }
        const list = trimmed.match(/^(\d+\.|[-*]) /);
        if (list) {
          const marker = list[1];
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-4 shrink-0 select-none font-mono text-[0.75rem] leading-[1.85] text-ink-faint">
                {marker === "-" || marker === "*" ? "·" : marker}
              </span>
              <div className="min-w-0 flex-1">
                {renderInline(trimmed.slice(list[0].length), h)}
                {isStreaming && isLast && <StreamingCursor />}
              </div>
            </div>
          );
        }
        if (trimmed === "---") return <hr key={idx} className="rule-t my-3 border-0" />;
        if (!trimmed) {
          return isStreaming && isLast ? (
            <p key={idx} className="pt-1">
              <StreamingCursor />
            </p>
          ) : (
            <div key={idx} className="h-1" />
          );
        }

        return (
          <p key={idx}>
            {renderInline(line, h)}
            {isStreaming && isLast && <StreamingCursor />}
          </p>
        );
      })}
    </div>
  );
}

const INLINE =
  /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[#[0-9a-zA-Z][^\]]*\]|\b(?:INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b)/g;

function renderInline(text: string, h: InlineHandlers): React.ReactNode {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-ink">
          {renderInline(part.slice(2, -2), h)}
        </strong>
      );
    }
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="not-italic text-ink-faint">
          {renderInline(part.slice(1, -1), h)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="font-mono text-[0.8125rem] text-ink">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("[#") && part.endsWith("]")) {
      // A footnote mark: the source number, click for the claims behind it.
      const key = part.slice(2, -1).trim().split(/\s+/)[0];
      const label = /^\d+$/.test(key) ? key : key.replace(/^c0*(\d+)-.*$/, "$1");
      return (
        <button
          key={i}
          type="button"
          onClick={() => h.onCitationClick(part)}
          title={part.slice(1, -1)}
          className="mx-0.5 inline-block -translate-y-[0.35em] font-mono text-[0.625rem] leading-none text-ink-faint transition-colors hover:text-ink"
        >
          {label}
        </button>
      );
    }
    if (TYPE_CODES.includes(part)) {
      return (
        <button
          key={i}
          type="button"
          onClick={() => h.onTypeClick(part)}
          title={`查看 ${part} 档案`}
          className="font-mono text-[0.875rem] text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:decoration-ink"
        >
          {part}
        </button>
      );
    }
    return part;
  });
}
