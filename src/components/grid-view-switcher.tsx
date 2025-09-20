"use client";

import { motion } from "motion/react";
import { useMBTIStore, GridViewMode } from "@/store/mbti-store";
import { cn } from "@/lib/utils";

const viewModes = [
  {
    id: "groups" as GridViewMode,
    name: "分组视图",
    description: "按MBTI四大组别分类",
    icon: "🎯",
  },
  {
    id: "dominantFunctions" as GridViewMode,
    name: "主导功能",
    description: "按认知功能主导类型分组",
    icon: "🧠",
  },
  {
    id: "matchPairs" as GridViewMode,
    name: "配对矩阵",
    description: "16×16配对关系矩阵",
    icon: "💕",
  },
  {
    id: "grid4x4" as GridViewMode,
    name: "4x4网格",
    description: "经典16宫格布局",
    icon: "📱",
  },
];

export function GridViewSwitcher() {
  const viewMode = useMBTIStore((state) => state.viewMode);
  const setViewMode = useMBTIStore((state) => state.setViewMode);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          视图模式
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          选择不同的展示方式
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {viewModes.map((mode) => {
          const isActive = viewMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200",
                "hover:shadow-md active:scale-95",
                isActive
                  ? "border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-700 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-2xl">{mode.icon}</span>
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-900 dark:text-gray-100"
                    )}
                  >
                    {mode.name}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isActive
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {mode.description}
                  </p>
                </div>
              </div>

              {/* 选中指示器 */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 border-2 border-gray-900 dark:border-gray-100 rounded-xl pointer-events-none"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
