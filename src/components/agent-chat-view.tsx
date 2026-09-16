"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Lightbulb,
  Send,
  Square,
  Key,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Database,
  Activity,
  Loader2,
  Zap,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mbtiTypes } from "@/data/core/mbti-data";
import { useMBTIStore } from "@/store/mbti-store";
import type { CitedClaim } from "@/services/mbti-agent-service";

const SHELL = "mx-auto w-full max-w-[1100px] px-4 sm:px-8 lg:px-12";
const TYPE_CODES = mbtiTypes.map((t) => t.type);

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolEvents?: Array<{ name: string; args?: Record<string, unknown>; status: "running" | "done" }>;
  citations?: CitedClaim[];
  isStreaming?: boolean;
  engine?: "gemini" | "offline_graph";
  model?: string;
}

const PRESET_DIAGNOSE = [
  "帮我测测我的真实 MBTI（直接出生活场景题考我）",
  "我总是分不清自己是 INFP 还是 INFJ，本质区别在哪？",
  "INTJ 和 INTP 看起来都很理智，生活里怎么准确分辨？",
  "帮我测一下我的第四位劣势功能（灵魂）是什么？压力大时怎么自救？",
];

const PRESET_CONSULT = [
  "INTJ 和 INFP 恋爱合盘：最大冲突点在哪？怎么破局？",
  "INTP 在职场严重拖延、只拆逻辑不执行，该怎么破局？",
  "如何与强势的 ENTJ / ESTJ 上司高效沟通而不内耗？",
  "INFJ 精神内耗严重，如何打开 Se 劣势功能回归现实？",
];

export function AgentChatView() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "consult" ? "consult" : "diagnose";

  const [mode, setMode] = useState<"diagnose" | "consult">(initialMode);
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
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const setSelectedType = useMBTIStore((s) => s.setSelectedType);
  const dbStats = useMBTIStore((s) => s.dbStats);

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
    if (m === "diagnose" || m === "consult") {
      setMode(m);
    }
  }, [searchParams]);

  // Set default greeting on first load or reset
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    if (mode === "diagnose") {
      setMessages([
        {
          id: "welcome-diag",
          role: "assistant",
          content:
            "你好，我是 Frank MBTI 认知架构师。\n\n我们今天**不搞 4 个字母的机械单选题**，直接从**荣格八维认知动力学**与**真实生活场景潜意识本能**出发。\n\n你可以告诉我你最纠结的两种类型（比如「我是 INFP 还是 INFJ」），或者直接让我出一道生动的现实场景题来拷问你的潜意识第一反应。",
          timestamp: timeStr,
        },
      ]);
    } else {
      setMessages([
        {
          id: "welcome-consult",
          role: "assistant",
          content:
            "你好，我是 Frank MBTI 认知架构师。\n\n这里接入了 **1,251 条原声观点图谱** 与 **136 组两两合盘动力学模型**。\n\n无论是亲密关系相处、职场沟通内耗，还是劣势功能（灵魂）的自救破局，把你的具体情境告诉我，我会实时调用图谱检索实据，为你梳理**攻守边界 (Boundary)** 与**落地破局解法 (Advice)**。",
          timestamp: timeStr,
        },
      ]);
    }
  }, [mode]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSaveKey = (val: string) => {
    setCustomKey(val);
    if (val.trim()) {
      localStorage.setItem("frank_mbti_gemini_key", val.trim());
    } else {
      localStorage.removeItem("frank_mbti_gemini_key");
    }
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
      const data = await res.json();
      setPingState({ testing: false, result: data });
    } catch (err: unknown) {
      setPingState({
        testing: false,
        result: {
          ok: false,
          model: selectedModel,
          latencyMs: 0,
          error: err instanceof Error ? err.message : "网络请求异常",
        },
      });
    }
  };

  const handleClearMessages = () => {
    if (loading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
    const timeStr = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    setMessages([
      {
        id: "msg-reset-" + Date.now(),
        role: "assistant",
        content:
          mode === "diagnose"
            ? "对话已重置。随时告诉我你的测试诉求或在纠结的类型，我们开始深度推导。"
            : "对话已重置。随时向我提出有关 MBTI 合盘、职场、内耗或认知功能的具体问题。",
        timestamp: timeStr,
      },
    ]);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || loading) return;

    if (!overrideText) setInput("");

    // Resize textarea back
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const timeStr = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: timeStr,
    };

    const assistantMsgId = "assistant-" + Date.now();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: timeStr,
      toolEvents: [],
      citations: [],
      isStreaming: true,
    };

    const newHistory = [...messages, userMsg];
    setMessages([...newHistory, assistantMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/mbti/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customKey ? { "x-gemini-api-key": customKey } : {}),
        },
        body: JSON.stringify({
          mode,
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          apiKey: customKey || undefined,
          model: selectedModel || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `请求失败 (${response.status})`);
      }

      if (!response.body) {
        throw new Error("无返回流数据");
      }

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
          const jsonStr = trimmed.slice(6);
          try {
            const event = JSON.parse(jsonStr);

            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id !== assistantMsgId) return msg;

                if (event.type === "engine") {
                  return {
                    ...msg,
                    engine: event.engine,
                    model: event.model,
                  };
                }

                if (event.type === "tool_call") {
                  const existing = msg.toolEvents || [];
                  return {
                    ...msg,
                    toolEvents: [
                      ...existing,
                      { name: event.name, args: event.args, status: "running" },
                    ],
                  };
                }

                if (event.type === "tool_result") {
                  const existing = msg.toolEvents || [];
                  return {
                    ...msg,
                    toolEvents: existing.map((t) =>
                      t.name === event.name ? { ...t, status: "done" } : t
                    ),
                  };
                }

                if (event.type === "citation" && event.citation) {
                  const existing = msg.citations || [];
                  if (existing.some((c) => c.id === event.citation.id)) return msg;
                  return {
                    ...msg,
                    citations: [...existing, event.citation],
                  };
                }

                if (event.type === "text_delta" && event.text) {
                  return {
                    ...msg,
                    content: msg.content + event.text,
                  };
                }

                if (event.type === "done") {
                  return {
                    ...msg,
                    isStreaming: false,
                  };
                }

                if (event.type === "error") {
                  return {
                    ...msg,
                    content: msg.content + `\n\n> ⚠️ *${event.message}*`,
                    isStreaming: false,
                  };
                }

                return msg;
              })
            );
          } catch {
            // Ignore parse errors on trailing deltas
          }
        }
      }
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      const errMsg = err instanceof Error ? err.message : "网络或服务异常";

      if (isAbort) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: m.content + "\n\n*(用户已手动终止输出)*", isStreaming: false }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    m.content +
                    `\n\n> ⚠️ **请求异常**：${errMsg}\n\n*提示：您可在右上角设置中配置个人 GEMINI_API_KEY，或检查本地网络环境。*`,
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const openTypeModal = (typeCode: string) => {
    const t = mbtiTypes.find((x) => x.type === typeCode.toUpperCase());
    if (t) setSelectedType(t);
  };

  return (
    <div className="min-h-full flex flex-col bg-paper text-ink">
      {/* 1. Header & Mode Switcher */}
      <div className="rule-b bg-paper/90 backdrop-blur-md sticky top-0 z-20">
        <div className={cn(SHELL, "py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3")}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-ink text-[0.6875rem] sm:text-[0.75rem] font-semibold tracking-wider">
                FRANK MBTI
              </span>
              <span className="text-ink-ghost text-xs">/</span>
              <span className="font-mono text-[0.6875rem] text-ink-soft">
                Agent v1.0
              </span>
            </div>

            {dbStats?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.625rem] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Graph 1,251 Claims
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.625rem] font-mono text-ink-soft bg-rule/50 border border-rule">
                <Database className="h-2.5 w-2.5 text-ink-faint" />
                Local Seeds 1,251 Claims
              </span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            {/* Mode Switch Tabs */}
            <div className="flex items-center p-0.5 rounded-md bg-rule/60 border border-rule text-[0.75rem] sm:text-[0.8125rem]">
              <button
                type="button"
                onClick={() => setMode("diagnose")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded transition-all duration-200",
                  mode === "diagnose"
                    ? "bg-paper text-ink font-medium shadow-xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <Compass className="h-3.5 w-3.5 text-ink" />
                <span>MBTI 推导</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("consult")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded transition-all duration-200",
                  mode === "consult"
                    ? "bg-paper text-ink font-medium shadow-xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <Lightbulb className="h-3.5 w-3.5 text-ink" />
                <span>图谱答疑</span>
              </button>
            </div>

            {/* Actions: Settings & Clear */}
            <div className="flex items-center gap-1 text-ink-soft">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                title="API 配置与状态"
                className={cn(
                  "p-1.5 rounded hover:bg-rule/60 hover:text-ink transition-colors",
                  (customKey || showSettings) && "text-ink"
                )}
              >
                <Key className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClearMessages}
                title="清空对话记录"
                className="p-1.5 rounded hover:bg-rule/60 hover:text-ink transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Optional Key Configuration Drawer */}
        {showSettings && (
          <div className="rule-t bg-paper/95 px-4 py-3 sm:px-12 border-b border-rule animate-in fade-in duration-200">
            <div className="max-w-[700px] mx-auto space-y-2">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[0.6875rem]">LLM API 接入配置 (Google Gemini)</span>
                <span className="font-mono text-[0.625rem] text-ink-faint">
                  支持 .env.local 或本地安全存储
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="在此填入 GEMINI_API_KEY（可选，默认优先读取 .env.local）"
                  value={customKey}
                  onChange={(e) => handleSaveKey(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono rounded border border-rule focus:outline-none focus:border-ink"
                />
                {customKey && (
                  <button
                    type="button"
                    onClick={() => handleSaveKey("")}
                    className="px-2 py-1.5 text-xs text-ink-soft hover:text-ink rounded border border-rule"
                  >
                    清除
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePingTest}
                  disabled={pingState.testing}
                  className="px-3 py-1.5 text-xs font-mono rounded border border-rule hover:border-ink transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50 text-ink"
                  title="向 Gemini API 发送极简连通性探测请求以测试 API 是否有效"
                >
                  {pingState.testing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-soft" />
                      <span>测试中...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="h-3.5 w-3.5 text-ink-soft" />
                      <span>测试连通性</span>
                    </>
                  )}
                </button>
              </div>

              {/* Ping Result Banner */}
              {pingState.result && (
                <div
                  className={cn(
                    "text-[0.6875rem] font-mono px-3 py-1.5 rounded border flex items-center justify-between gap-2 animate-in fade-in duration-150",
                    pingState.result.ok
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        pingState.result.ok ? "bg-emerald-500" : "bg-rose-500"
                      )}
                    />
                    <span className="truncate">
                      {pingState.result.ok
                        ? `API 正常工作 · 响应耗时 ${pingState.result.latencyMs}ms (${pingState.result.model})`
                        : `API 未正常连通 · ${pingState.result.error || "未知异常"}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPingState({ testing: false })}
                    className="text-[0.625rem] opacity-60 hover:opacity-100 shrink-0 px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-ink-soft shrink-0">优先模型：</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "gemini-3.8-flash", label: "3.8 Flash (推荐)" },
                    { id: "gemini-flash-latest", label: "Flash Latest (稳定)" },
                    { id: "gemini-3.5-flash-lite", label: "3.5 Lite (抗压)" },
                    { id: "gemini-3.1-pro-preview", label: "3.1 Pro (深度)" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSaveModel(m.id)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[0.6875rem] font-mono border transition-colors",
                        selectedModel === m.id
                          ? "bg-ink text-paper border-ink"
                          : "bg-paper text-ink-soft border-rule hover:border-ink"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[0.6875rem] text-ink-soft leading-relaxed">
                💡 若遇 Google 官方模型并发高负载（503 临时繁忙），系统会自动在备选模型间智能重试并优雅兜底至本地图谱引擎，保障问答与合盘随时可用。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Messages Stream */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(SHELL, "py-6 space-y-6")}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-1.5 transition-opacity duration-300",
                m.role === "user" ? "items-end" : "items-start"
              )}
            >
              {/* Sender & Timestamp Header */}
              <div className="flex items-center gap-2 px-1 text-[0.6875rem] font-mono text-ink-faint">
                <span>{m.role === "user" ? "YOU" : "FRANK MBTI AGENT"}</span>
                <span>·</span>
                <span>{m.timestamp}</span>
                {m.role === "assistant" && m.engine && (
                  <>
                    <span>·</span>
                    {m.engine === "gemini" ? (
                      <span className="inline-flex items-center gap-1 text-[0.625rem] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
                        <Zap className="h-2.5 w-2.5" />
                        <span>{m.model || "Gemini"} · 实时推理</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[0.625rem] text-ink-soft bg-rule/40 px-1.5 py-0.5 rounded border border-rule">
                        <Layers className="h-2.5 w-2.5" />
                        <span>内置图谱引擎</span>
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Message Bubble Card */}
              <div
                className={cn(
                  "max-w-[90%] sm:max-w-[80%] rounded-lg p-4 text-[0.875rem] leading-[1.8] tracking-normal transition-all",
                  m.role === "user"
                    ? "bg-rule/40 border border-rule text-ink whitespace-pre-wrap"
                    : "bg-paper border border-rule text-ink shadow-xs"
                )}
              >
                {/* Tool Calling Step Badges */}
                {m.toolEvents && m.toolEvents.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5 pb-2 rule-b">
                    {m.toolEvents.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.625rem] font-mono text-ink-soft bg-rule/40 border border-rule"
                      >
                        {t.status === "running" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                        ) : (
                          <Check className="h-2.5 w-2.5 text-emerald-600" />
                        )}
                        <span>{formatToolLabel(t.name, t.args)}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Main Content Rendered with Rich Text and Interactive Type Chips */}
                {m.content ? (
                  <MarkdownRenderer content={m.content} onTypeClick={openTypeModal} />
                ) : (
                  <div className="flex items-center gap-2 text-ink-soft font-mono text-xs py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
                    <span>认知图谱检索并推演中...</span>
                  </div>
                )}

                {/* Citations Shelf */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-4 pt-3 rule-t space-y-2">
                    <div className="flex items-center justify-between text-[0.6875rem] font-mono text-ink-soft">
                      <span className="flex items-center gap-1.5">
                        <Search className="h-3 w-3 text-ink-faint" />
                        <span>引用图谱观点 ({m.citations.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCitations((prev) => ({
                            ...prev,
                            [m.id]: !prev[m.id],
                          }))
                        }
                        className="flex items-center gap-0.5 text-ink-soft hover:text-ink"
                      >
                        <span>{expandedCitations[m.id] ? "收起" : "展开"}</span>
                        {expandedCitations[m.id] ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {/* Citations Preview list */}
                    <div className="space-y-1.5">
                      {m.citations
                        .slice(0, expandedCitations[m.id] ? undefined : 2)
                        .map((c) => (
                          <div
                            key={c.id}
                            className="p-2 rounded bg-rule/25 border border-rule text-xs space-y-1"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-mono text-[0.6875rem] font-medium text-ink">
                                #{String(c.sourceIndex).padStart(3, "0")} {c.sourceTitle}
                              </span>
                              {c.kind && (
                                <span className="font-mono text-[0.625rem] text-ink-faint">
                                  {c.kind}
                                </span>
                              )}
                            </div>
                            <p className="text-[0.8125rem] text-ink-soft leading-relaxed">
                              “{c.statement}”
                            </p>
                            {c.advice && (
                              <p className="text-[0.75rem] text-ink leading-normal">
                                → 建议：{c.advice}
                              </p>
                            )}
                            {c.boundary && (
                              <p className="text-[0.75rem] text-ink-soft leading-normal">
                                🛡 边界：{c.boundary}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Preset Question Chips */}
      <div className="rule-t bg-paper/60 backdrop-blur-xs">
        <div className={cn(SHELL, "py-2.5")}>
          <div className="flex items-center gap-2 overflow-x-auto scroll-quiet pb-1">
            <span className="eyebrow text-[0.625rem] shrink-0 text-ink-faint">
              灵感提问
            </span>
            {(mode === "diagnose" ? PRESET_DIAGNOSE : PRESET_CONSULT).map((q, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSend(q)}
                className="shrink-0 text-xs px-2.5 py-1 rounded-full border border-rule bg-paper hover:border-ink hover:text-ink text-ink-soft transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Input Bar */}
      <div className="rule-t bg-paper p-4">
        <div className={cn(SHELL)}>
          <div className="relative flex items-end gap-2 rounded-lg border border-rule-strong bg-paper p-2 focus-within:border-ink transition-colors shadow-xs">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              placeholder={
                mode === "diagnose"
                  ? "输入你的困惑、正在纠结的 MBTI 类型，或直接回答上述场景..."
                  : "输入关于 MBTI 恋爱合盘、职场相处或个人成长的具体问题..."
              }
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
              className="flex-1 resize-none bg-transparent px-2 py-1 text-[0.875rem] text-ink placeholder:text-ink-ghost focus:outline-none leading-relaxed"
            />

            {loading ? (
              <button
                type="button"
                onClick={handleStop}
                title="停止生成"
                className="shrink-0 p-2 rounded-md bg-ink text-paper hover:opacity-80 transition-opacity"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!input.trim()}
                onClick={() => handleSend()}
                title="发送 (Enter)"
                className={cn(
                  "shrink-0 p-2 rounded-md transition-all",
                  input.trim()
                    ? "bg-ink text-paper hover:opacity-80"
                    : "bg-rule text-ink-ghost cursor-not-allowed"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[0.625rem] text-ink-faint font-mono px-1">
            <span>Enter 发送，Shift + Enter 换行</span>
            <span>点击回答中的 MBTI 代码可调出完整类型档案</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatToolLabel(name: string, args?: Record<string, unknown>): string {
  switch (name) {
    case "search_claims":
      return `检索观点库: ${(args?.query as string) || (args?.type as string) || "综合"}`;
    case "get_type_profile":
      return `查询档案: ${(args?.type as string) || ""}`;
    case "get_pair_dynamics":
      return `分析合盘: ${(args?.type1 as string) || ""} × ${(args?.type2 as string) || ""}`;
    case "get_cognitive_axis":
      return `八维解析: ${(args?.axisOrFunction as string) || ""}`;
    default:
      return `执行: ${name}`;
  }
}

// ---------------------------------------------------------------------------
// Markdown & MBTI Chip Renderer
// ---------------------------------------------------------------------------

function MarkdownRenderer({
  content,
  onTypeClick,
}: {
  content: string;
  onTypeClick: (type: string) => void;
}) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-ink">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-sm font-semibold text-ink pt-2 pb-0.5 tracking-tight">
              {renderFormattedInline(trimmed.slice(4), onTypeClick)}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-base font-semibold text-ink pt-2.5 pb-1 tracking-tight">
              {renderFormattedInline(trimmed.slice(3), onTypeClick)}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-lg font-bold text-ink pt-3 pb-1 tracking-tight">
              {renderFormattedInline(trimmed.slice(2), onTypeClick)}
            </h1>
          );
        }
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-rule-strong pl-3 py-1 my-1 text-ink-soft text-[0.8125rem] italic"
            >
              {renderFormattedInline(trimmed.slice(2), onTypeClick)}
            </blockquote>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-ink-faint select-none">•</span>
              <div className="flex-1">{renderFormattedInline(trimmed.slice(2), onTypeClick)}</div>
            </div>
          );
        }
        if (trimmed === "---") {
          return <hr key={idx} className="border-t border-rule my-3" />;
        }
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        return <p key={idx}>{renderFormattedInline(line, onTypeClick)}</p>;
      })}
    </div>
  );
}

function renderFormattedInline(text: string, onTypeClick: (t: string) => void): React.ReactNode {
  // Regex to split by bold (**...**), code (`...`), citations ([#123 ...]), or MBTI types
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[#[0-9]+[^\]]*\]|\b(?:INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b)/g;

  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {renderFormattedInline(part.slice(2, -2), onTypeClick)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="font-mono text-xs px-1.5 py-0.5 rounded bg-rule/50 text-ink">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("[#") && part.endsWith("]")) {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.2 rounded font-mono text-[0.6875rem] text-ink font-medium bg-rule/60 border border-rule mx-0.5"
        >
          {part.slice(1, -1)}
        </span>
      );
    }

    if (TYPE_CODES.includes(part)) {
      return (
        <button
          key={i}
          type="button"
          onClick={() => onTypeClick(part)}
          title={`点击查看 ${part} 完整档案`}
          className="inline-flex items-center px-1.5 py-0.2 rounded font-mono text-xs font-semibold text-ink bg-rule hover:bg-ink hover:text-paper transition-colors mx-0.5 cursor-pointer"
        >
          {part}
        </button>
      );
    }

    return part;
  });
}
