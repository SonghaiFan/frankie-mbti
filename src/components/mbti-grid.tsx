"use client";

import { GridViewSwitcher } from "@/components/grid-view-switcher";
import { DominantFunctionsView } from "@/components/dominant-functions-view";
import { MatchMatrixView } from "@/components/match-matrix-view";
import { GroupsView } from "@/components/groups-view";
import { useMBTIStore } from "@/store/mbti-store";
import { MBTICompactTable } from "@/components/mbti-compact-table";
import { MBTICard } from "@/components/mbti-card";

export function MBTIGrid() {
  const viewMode = useMBTIStore((state) => state.viewMode);
  const selectedType = useMBTIStore((state) => state.selectedType);
  const collapseCard = useMBTIStore((state) => state.collapseCard);

  return (
    <div className="space-y-6">
      {/* 视图切换器 */}
      <GridViewSwitcher />

      {/* 根据视图模式渲染不同的内容 */}
      {viewMode === "groups" && <GroupsView />}
      {viewMode === "dominantFunctions" && <DominantFunctionsView />}
      {viewMode === "matchPairs" && <MatchMatrixView />}
      {viewMode === "compact" && <MBTICompactTable />}

      {/* In compact view, render the selected card as a modal overlay */}
      {viewMode === "compact" && selectedType && (
        <MBTICard
          type={selectedType}
          isExpanded={true}
          onExpand={() => {}}
          onCollapse={collapseCard}
        />
      )}
    </div>
  );
}
