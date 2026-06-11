"use client";

import { useMBTIStore, GridViewMode } from "@/store/mbti-store";
import { cn } from "@/lib/utils";
import { HiViewGrid, HiHeart, HiCollection } from "react-icons/hi";
import { TbBrain } from "react-icons/tb";

const viewModes = [
  {
    id: "groups" as GridViewMode,
    name: "分组视图",
    description: "按MBTI四大组别和态度倾向排列",
    icon: HiViewGrid,
  },
  {
    id: "dominantFunctions" as GridViewMode,
    name: "主导功能",
    description: "按认知功能主导类型分组",
    icon: TbBrain,
  },
  {
    id: "matchPairs" as GridViewMode,
    name: "配对矩阵",
    description: "16×16配对关系矩阵",
    icon: HiHeart,
  },
  {
    id: "compact" as GridViewMode,
    name: "一览表",
    description: "表格快速浏览与检索",
    icon: HiCollection,
  },
];

export function GridViewSwitcher() {
  const viewMode = useMBTIStore((state) => state.viewMode);
  const setViewMode = useMBTIStore((state) => state.setViewMode);

  return (
    <div className="mb-8 px-2 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {viewModes.map((mode) => {
          const isActive = viewMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                "p-4 border-4 border-black rounded-none transition-all duration-150 w-full text-left relative",
                "shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]",
                "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                isActive
                  ? "bg-bauhaus-red text-white"
                  : "bg-white text-black hover:bg-gray-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <mode.icon className="text-xl sm:text-2xl shrink-0" />
                <div>
                  <p className="text-sm font-black uppercase tracking-wider">
                    {mode.name}
                  </p>
                  <p
                    className={cn(
                      "text-xs leading-normal mt-0.5",
                      isActive ? "text-red-100" : "text-gray-600"
                    )}
                  >
                    {mode.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

