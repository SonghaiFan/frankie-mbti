import { PairingReelsView } from "@/components/pairing-reels-view";
import { ViewShell } from "@/components/view-shell";

export const metadata = {
  title: "配对 · Frank MBTI",
  description: "转动左右两轮，看两个类型的功能栈如何咬合。",
};

export default function PairingPage() {
  return (
    <ViewShell>
      <PairingReelsView />
    </ViewShell>
  );
}
