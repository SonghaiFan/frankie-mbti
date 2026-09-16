import { Suspense } from "react";
import { AgentChatView } from "@/components/agent-chat-view";

export const metadata = {
  title: "AI 咨询与推导 · Frank MBTI",
  description:
    "基于 16 型八维认知动力学、Beebe 8 位能量模型与 1,251 条原声观点图谱的智能推导与深度答疑。",
};

export default function ConsultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-12 text-ink-soft font-mono text-xs">
          Loading Frank MBTI Agent...
        </div>
      }
    >
      <AgentChatView />
    </Suspense>
  );
}
