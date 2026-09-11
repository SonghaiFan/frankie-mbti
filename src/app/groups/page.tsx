import { GroupsView } from "@/components/groups-view";
import { ViewShell } from "@/components/view-shell";

export const metadata = {
  title: "四大组别 · Frank MBTI",
  description: "按性格色彩与四大阵营（分析师、外交官、守护者、探险家）分组的十六型索引。",
};

export default function GroupsPage() {
  return (
    <ViewShell>
      <GroupsView />
    </ViewShell>
  );
}
