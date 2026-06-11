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
        className="text-left mb-6 border-b-4 border-black pb-4"
      >
        <span className="bg-bauhaus-blue text-white text-xs font-bold px-2.5 py-1 tracking-widest uppercase inline-block mb-2">FUNCTION ANALYSIS</span>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">
          主导功能分组
        </h2>
        <p className="text-sm text-gray-700 font-medium mt-1">
          按照认知功能的主导类型（Dominant Function）进行平面矩阵分组展示
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(dominantFunctionGroups).map(([func, group], index) => {
          const groupTypes = mbtiTypes.filter((type) =>
            group.types.includes(type.type)
          );

          return (
            <motion.div
              key={func}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={cn(
                "space-y-4 rounded-none border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]",
                "flex flex-col relative hover:shadow-[6px_6px_0px_0px_rgba(18,18,18,1)] transition-all duration-150 text-left",
                groupTypes.some((type) => selectedType?.type === type.type)
                  ? "z-[90]"
                  : "z-[1]"
              )}
            >
              {/* 组别标题 - 包豪斯几何框体 */}
              <div
                className={cn(
                  "p-4 border-4 border-black rounded-none relative overflow-hidden flex flex-col justify-between h-36",
                  group.bgColor
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{group.icon}</span>
                    <h3 className={cn("text-lg font-black tracking-wider uppercase", group.color)}>
                      {func}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black bg-white",
                      group.color
                    )}
                  >
                    {group.types.join(" / ")}
                  </span>
                </div>

                <div className="mt-2">
                  <p className={cn("text-xs font-black uppercase tracking-wider", group.color)}>
                    {group.name}
                  </p>
                  <p className="text-xs text-gray-800 font-medium leading-snug mt-0.5">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 flex-1">
                {groupTypes.map((type, typeIndex) => (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08 + typeIndex * 0.05 }}
                    className={cn(
                      "h-[120px]",
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

