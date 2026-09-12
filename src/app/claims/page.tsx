import { ClaimsView } from "@/components/claims-view";
import { ViewShell } from "@/components/view-shell";

export const metadata = {
  title: "观点 · Frank MBTI",
  description: "从三起 540 条视频拆出的 1251 条观点，按类型、情境、观点类型、认知功能与关键词查询。",
};

export default function ClaimsPage() {
  return (
    <ViewShell>
      <ClaimsView />
    </ViewShell>
  );
}
