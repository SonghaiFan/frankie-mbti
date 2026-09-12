import { DominantFunctionsView } from "@/components/dominant-functions-view";
import { ViewShell } from "@/components/view-shell";

export const metadata = {
  title: "主导功能 · Frank MBTI",
  description: "八个主导认知功能各自怎么运转、日常什么样、感情里什么样、过头和怎么练，以及主导它的两个类型。",
};

export default function FunctionsPage() {
  return (
    <ViewShell>
      <DominantFunctionsView />
    </ViewShell>
  );
}
