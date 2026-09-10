import { DominantFunctionsView } from "@/components/dominant-functions-view";
import { ViewShell } from "@/components/view-shell";

export const metadata = {
  title: "主导功能 · Frank MBTI",
  description: "按主导认知功能分组的十六型索引。",
};

export default function FunctionsPage() {
  return (
    <ViewShell>
      <DominantFunctionsView />
    </ViewShell>
  );
}
