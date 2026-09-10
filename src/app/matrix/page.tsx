import { MatchMatrixView } from "@/components/match-matrix-view";
import { ViewShell } from "@/components/view-shell";

export const metadata = {
  title: "配对矩阵 · Frank MBTI",
  description: "16 × 16 契合度矩阵，附荣格配对原理。",
};

export default function MatrixPage() {
  return (
    <ViewShell>
      <MatchMatrixView />
    </ViewShell>
  );
}
