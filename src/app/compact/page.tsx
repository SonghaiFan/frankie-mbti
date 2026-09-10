import { MBTICompactTable } from "@/components/mbti-compact-table";
import { ViewShell } from "@/components/view-shell";

export const metadata = {
  title: "一览表 · Frank MBTI",
  description: "所有类型、昵称、认知功能与官方最佳配对的紧凑视图。",
};

export default function CompactPage() {
  return (
    <ViewShell>
      <MBTICompactTable />
    </ViewShell>
  );
}
