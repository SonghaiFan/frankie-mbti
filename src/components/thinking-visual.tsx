"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MatrixLoader } from "@/components/matrix-loader";
import { cn } from "@/lib/utils";

const easeSmoothOut = [0.22, 1, 0.36, 1] as const;

export interface ToolCallEvent {
  name: string;
  args?: Record<string, unknown>;
  summary?: string;
}

const DEFAULT_THINKING_STATES = [
  "解析提问情境与性格两难…",
  "检索知识图谱实体与观点…",
  "比对主导功能与辅助功能运作动力…",
  "推导功能栈盲点与潜在应对对策…",
  "组织针对性的认知洞察报告…",
];

function formatToolLabel(name: string, args?: Record<string, unknown>): string {
  switch (name) {
    case "search_claims":
      return `检索观点 ${(args?.query as string) || (args?.type as string) || ""}`.trim();
    case "get_type_profile":
      return `读取档案 ${(args?.type as string) || ""}`.trim();
    case "get_pair_dynamics":
    case "get_relations":
      return `读取配对 ${(args?.type1 as string) || ""} × ${(args?.type2 as string) || ""}`;
    case "get_cognitive_axis":
    case "get_cognitive_function":
      return `读取功能 ${(args?.axisOrFunction as string) || ""}`.trim();
    case "query_graph":
      return `查询图谱${args?.purpose ? ` · ${args.purpose as string}` : ""}`;
    default:
      return name;
  }
}

interface ThinkingVisualProps {
  streaming?: boolean;
  toolEvents?: ToolCallEvent[];
  thinking?: string;
  open?: boolean;
  onToggle?: () => void;
  className?: string;
  states?: string[];
  mode?: "compact" | "card" | "inline";
}

export function ThinkingVisual({
  streaming = true,
  toolEvents = [],
  thinking,
  open = false,
  onToggle,
  className,
  states = DEFAULT_THINKING_STATES,
}: ThinkingVisualProps) {
  const [stateIndex, setStateIndex] = useState(0);

  // Cycle thinking state text every 2.4s while streaming
  useEffect(() => {
    if (!streaming) return;
    const timer = setInterval(() => {
      setStateIndex((prev) => (prev + 1) % states.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [streaming, states.length]);

  const stepsCount = toolEvents.length + (thinking ? 1 : 0);

  // If not streaming and no recorded reasoning/tools, don't show anything
  if (!streaming && stepsCount === 0) {
    return null;
  }

  // Active state headline
  let currentState = states[stateIndex] || states[0];
  if (streaming && toolEvents.length > 0) {
    const lastTool = toolEvents[toolEvents.length - 1];
    if (lastTool) {
      if (lastTool.summary) {
        currentState = `${lastTool.summary}…`;
      } else {
        currentState = `${formatToolLabel(lastTool.name, lastTool.args)}…`;
      }
    }
  }

  return (
    <div className={cn("text-[0.75rem] leading-relaxed select-none", className)}>
      <div className="flex items-center gap-2.5">
        {streaming ? (
          <MatrixLoader variant="scan" size="sm" />
        ) : (
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink/10 font-mono text-[0.625rem] text-ink font-semibold">
            ✓
          </span>
        )}

        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="group flex items-center gap-2 text-left transition-colors"
          >
            {streaming ? (
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentState}
                  initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                  transition={{ duration: 0.15, ease: easeSmoothOut }}
                  className="t-think-shimmer font-mono text-[0.75rem] font-medium"
                >
                  {currentState}
                </motion.span>
              </AnimatePresence>
            ) : (
              <span className="font-mono text-[0.75rem] text-ink-soft group-hover:text-ink">
                思考过程 · 已读取图谱
              </span>
            )}

            <span className="font-mono text-[0.6875rem] text-ink-ghost transition-colors group-hover:text-ink-soft">
              {open ? "收起 −" : `展开详情 ${stepsCount > 0 ? `(${stepsCount})` : ""} +`}
            </span>
          </button>
        ) : (
          <AnimatePresence mode="wait">
            <motion.span
              key={currentState}
              initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
              transition={{ duration: 0.15, ease: easeSmoothOut }}
              className="t-think-shimmer font-mono text-[0.75rem]"
            >
              {currentState}
            </motion.span>
          </AnimatePresence>
        )}
      </div>

      {/* Expandable Reasoning Details */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easeSmoothOut }}
            className="overflow-hidden"
          >
            <div className="rule-l mt-2.5 space-y-2 pl-3 py-1 text-ink-soft">
              {toolEvents.map((t, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-ink-faint">
                    <span className="rounded bg-ink/5 px-1 py-0.2 font-mono text-[0.625rem] text-ink">
                      {formatToolLabel(t.name, t.args)}
                    </span>
                    {t.summary && <span className="text-ink-soft">· {t.summary}</span>}
                  </div>
                  {t.name === "query_graph" && typeof t.args?.cypher === "string" && (
                    <pre className="mt-1 max-w-full overflow-x-auto rounded bg-ink/[0.03] p-2 font-mono text-[0.6875rem] leading-relaxed text-ink-soft">
                      {t.args.cypher}
                    </pre>
                  )}
                </div>
              ))}
              {thinking && (
                <p className="mt-1 whitespace-pre-wrap font-sans text-[0.8125rem] leading-relaxed text-ink-soft">
                  {thinking}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Minimal typing stream indicator with pulsing cursor
 */
export function StreamingCursor() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-1.5 ml-1 bg-ink align-baseline animate-pulse select-none"
    />
  );
}
