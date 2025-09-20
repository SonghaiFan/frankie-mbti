"use client";

import { motion } from "motion/react";
import { mbtiTypes } from "@/data/mbti-data";
import { MBTICard } from "@/components/mbti-card";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";

const dominantFunctionGroups = {
  Ni: {
    name: "内向直觉主导",
    description: "深度洞察与远见规划者",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    icon: "🔮",
    types: ["INTJ", "INFJ"],
  },
  Ne: {
    name: "外向直觉主导",
    description: "创新探索与可能性发现者",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100/50 dark:bg-purple-900/20",
    icon: "✨",
    types: ["ENTP", "ENFP"],
  },
  Ti: {
    name: "内向思维主导",
    description: "逻辑分析与理论建构者",
    color: "text-blue-900 dark:text-blue-100",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    icon: "🧠",
    types: ["INTP", "ISTP"],
  },
  Te: {
    name: "外向思维主导",
    description: "系统组织与高效执行者",
    color: "text-blue-900 dark:text-blue-100",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    icon: "📊",
    types: ["ENTJ", "ESTJ"],
  },
  Fi: {
    name: "内向情感主导",
    description: "价值坚守与真实表达者",
    color: "text-pink-700 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/20",
    icon: "💭",
    types: ["INFP", "ISFP"],
  },
  Fe: {
    name: "外向情感主导",
    description: "和谐协调与关爱他人者",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100/50 dark:bg-pink-900/20",
    icon: "❤️",
    types: ["ENFJ", "ESFJ"],
  },
  Si: {
    name: "内向感觉主导",
    description: "经验积累与稳定守护者",
    color: "text-slate-700 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/20",
    icon: "📚",
    types: ["ISTJ", "ISFJ"],
  },
  Se: {
    name: "外向感觉主导",
    description: "当下体验与灵活应变者",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    icon: "🎯",
    types: ["ESTP", "ESFP"],
  },
};

export function DominantFunctionsView() {
  const selectedType = useMBTIStore((state) => state.selectedType);
  const expandCard = useMBTIStore((state) => state.expandCard);
  const collapseCard = useMBTIStore((state) => state.collapseCard);

  return (
    <div className="mb-8 px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 sm:mb-6"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          主导功能分组
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">
          按照认知功能的主导类型进行分组展示
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(dominantFunctionGroups).map(([func, group], index) => {
          const groupTypes = mbtiTypes.filter((type) =>
            group.types.includes(type.type)
          );

          return (
            <motion.div
              key={func}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "space-y-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-2 sm:p-3",
                "flex flex-col relative hover:shadow-lg transition-shadow duration-200",
                groupTypes.some((type) => selectedType?.type === type.type)
                  ? "z-[90]"
                  : "z-[1]"
              )}
            >
              {/* 组别标题 - 带左侧色条增强层级，轻度使用组别背景作为点缀 */}
              <div
                className={cn(
                  "p-6 flex flex-col h-[200px] rounded-lg relative overflow-hidden",
                  group.bgColor
                )}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b from-black/10 to-black/0 dark:from-white/10 dark:to-white/0" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.icon}</span>
                    <div>
                      <h3 className={cn("text-lg font-bold", group.color)}>
                        {func}
                      </h3>
                      <p className={cn("text-xs font-medium", group.color)}>
                        {group.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {group.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    主导功能类型:
                  </span>
                  <span
                    className={cn(
                      "text-xs font-mono px-2 py-1 rounded",
                      group.color,
                      group.bgColor,
                      "bg-opacity-50"
                    )}
                  >
                    {group.types.join(" · ")}
                  </span>
                </div>
              </div>

              <div className="grid gap-2 px-6 pb-6">
                {groupTypes.map((type, typeIndex) => (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + typeIndex * 0.05 }}
                    className={cn(
                      "h-[100px] sm:h-[120px]",
                      selectedType?.type === type.type ? "z-[100]" : "z-[1]"
                    )}
                  >
                    <MBTICard
                      type={type}
                      isExpanded={selectedType?.type === type.type}
                      onExpand={() => expandCard(type)}
                      onCollapse={collapseCard}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
