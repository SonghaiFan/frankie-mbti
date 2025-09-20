"use client";

import { GridViewSwitcher } from "@/components/grid-view-switcher";
import { DominantFunctionsView } from "@/components/dominant-functions-view";
import { MatchMatrixView } from "@/components/match-matrix-view";
import { EnhancedGroupsView } from "@/components/groups-view";
import { useMBTIStore } from "@/store/mbti-store";

export function MBTIGrid() {
  const viewMode = useMBTIStore((state) => state.viewMode);

  return (
    <div className="space-y-6">
      {/* 视图切换器 */}
      <GridViewSwitcher />

      {/* 根据视图模式渲染不同的内容 */}
      {viewMode === "groups" && <EnhancedGroupsView />}
      {viewMode === "dominantFunctions" && <DominantFunctionsView />}
      {viewMode === "matchPairs" && <MatchMatrixView />}
    </div>
  );
}
