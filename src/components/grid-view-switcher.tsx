"use client";

import { motion } from "motion/react";
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
    <div className="mb-4 sm:mb-6 px-2 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-2">
        {viewModes.map((mode) => {
          const isActive = viewMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                "p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
                "hover:shadow-md active:scale-95 w-full",
                isActive
                  ? "border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-700 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-3">
                <mode.icon className="text-xl sm:text-2xl mx-auto sm:mx-0" />
                <div className="flex-1 sm:flex-initial">
                  <p
                    className={cn(
                      "text-sm sm:text-base font-medium",
                      isActive
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-900 dark:text-gray-100"
                    )}
                  >
                    {mode.name}
                  </p>
                  <p
                    className={cn(
                      "text-xs sm:text-sm mt-1",
                      isActive
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {mode.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
