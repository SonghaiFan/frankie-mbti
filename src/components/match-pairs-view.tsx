"use client";

import { motion } from "motion/react";
import { mbtiMatches, mbtiTypes } from "@/data/mbti-data";
import { MBTICard } from "@/components/mbti-card";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";

const matchTypeColors = {
  镜像对应: {
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: "🪞",
    description: "完美互补的功能配置",
  },
  "主导=劣势": {
    color: "text-blue-900 dark:text-blue-100",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: "⚡",
    description: "优势互补，激发成长",
  },
  "辅助=第三": {
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    icon: "🤝",
    description: "稳定和谐的伙伴关系",
  },
  字母完全相反: {
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    icon: "🔄",
    description: "挑战与成长的对立关系",
  },
};

export function MatchPairsView() {
  const selectedType = useMBTIStore((state) => state.selectedType);
  const expandCard = useMBTIStore((state) => state.expandCard);
  const collapseCard = useMBTIStore((state) => state.collapseCard);

  // 按配对类型分组
  const groupedMatches = mbtiMatches.reduce((acc, match) => {
    const type = match.matchType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(match);
    return acc;
  }, {} as Record<string, typeof mbtiMatches>);

  return (
    <div className="space-y-8 mb-8">
      {Object.entries(groupedMatches).map(
        ([matchType, matches], groupIndex) => {
          const typeStyle = matchTypeColors[
            matchType as keyof typeof matchTypeColors
          ] || {
            color: "text-gray-700 dark:text-gray-400",
            bgColor: "bg-gray-50 dark:bg-gray-950/20",
            borderColor: "border-gray-200 dark:border-gray-800",
            icon: "❓",
            description: "未定义的配对类型",
          };

          return (
            <motion.div
              key={matchType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className={cn(
                "rounded-2xl border-2 p-6",
                typeStyle.borderColor,
                typeStyle.bgColor
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{typeStyle.icon}</span>
                <div>
                  <h3 className={cn("text-xl font-bold", typeStyle.color)}>
                    {matchType}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {typeStyle.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={cn(
                      "text-xs px-3 py-1 rounded-full",
                      typeStyle.color,
                      typeStyle.bgColor
                    )}
                  >
                    {matches.length} 对配对
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match, matchIndex) => {
                  const type1 = mbtiTypes.find((t) => t.type === match.pair[0]);
                  const type2 = mbtiTypes.find((t) => t.type === match.pair[1]);

                  if (!type1 || !type2) return null;

                  const isExpanded =
                    selectedType?.type === type1.type ||
                    selectedType?.type === type2.type;

                  return (
                    <motion.div
                      key={`${match.pair[0]}-${match.pair[1]}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: groupIndex * 0.1 + matchIndex * 0.05,
                      }}
                      className={cn(
                        "bg-white dark:bg-gray-800 rounded-xl p-4 border",
                        typeStyle.borderColor,
                        "hover:shadow-lg transition-shadow duration-200",
                        isExpanded ? "z-[90] shadow-xl" : "z-[1]"
                      )}
                    >
                      {/* 配对名称和描述 */}
                      <div className="text-center mb-4">
                        <h4
                          className={cn("font-bold text-lg", typeStyle.color)}
                        >
                          {match.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {match.description}
                        </p>
                      </div>

                      {/* 配对的两个类型 */}
                      <div className="space-y-3">
                        <div className="relative">
                          <MBTICard
                            type={type1}
                            isExpanded={selectedType?.type === type1.type}
                            onExpand={() => expandCard(type1)}
                            onCollapse={collapseCard}
                          />
                        </div>

                        {/* 连接线 */}
                        <div className="flex items-center justify-center">
                          <div
                            className={cn(
                              "flex items-center gap-2 px-3 py-1 rounded-full text-xs",
                              typeStyle.color,
                              typeStyle.bgColor
                            )}
                          >
                            <span>💕</span>
                            <span>配对</span>
                          </div>
                        </div>

                        <div className="relative">
                          <MBTICard
                            type={type2}
                            isExpanded={selectedType?.type === type2.type}
                            onExpand={() => expandCard(type2)}
                            onCollapse={collapseCard}
                          />
                        </div>
                      </div>

                      {/* 配对兼容度指示 */}
                      <div className="mt-4 text-center">
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 px-2 py-1 rounded text-xs",
                            typeStyle.color,
                            typeStyle.bgColor
                          )}
                        >
                          <span>🎯</span>
                          <span>配对类型: {matchType}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        }
      )}
    </div>
  );
}
