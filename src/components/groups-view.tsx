"use client";

import { motion } from "motion/react";
import { mbtiTypes, groupExplanations, mbtiGroups } from "@/data/mbti-data";
import { MBTICard } from "@/components/mbti-card";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";

// 按照MBTI四大组别和态度倾向排列
const enhancedGroupLayout = [
  ["INTJ", "INTP", "ENTJ", "ENTP"],
  ["INFJ", "INFP", "ENFJ", "ENFP"],
  ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  ["ISTP", "ISFP", "ESTP", "ESFP"],
];

const rowLabels = [
  {
    label: "NT",
    description: "分析师 - 直觉+思维",
    color: "text-purple-900 dark:text-purple-100",
    group: "分析师",
  },
  {
    label: "NF",
    description: "外交官 - 直觉+情感",
    color: "text-green-900 dark:text-green-100",
    group: "外交官",
  },
  {
    label: "SJ",
    description: "守护者 - 感觉+判断",
    color: "text-blue-900 dark:text-blue-100",
    group: "守护者",
  },
  {
    label: "SP",
    description: "探险家 - 感觉+感知",
    color: "text-orange-900 dark:text-orange-100",
    group: "探险家",
  },
];

export function GroupsView() {
  const selectedType = useMBTIStore((state) => state.selectedType);
  const expandCard = useMBTIStore((state) => state.expandCard);
  const collapseCard = useMBTIStore((state) => state.collapseCard);

  return (
    <div className="mb-8 px-2 sm:px-0">
      {/* 标题说明 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 sm:mb-6"
      >
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          MBTI 四大组别视图
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 px-2">
          按照四大组别的矩阵布局
        </p>
      </motion.div>

      <div className="space-y-6">
        {enhancedGroupLayout.map((row, rowIndex) => {
          const rowInfo = rowLabels[rowIndex];
          const explanation =
            groupExplanations[rowInfo.group as keyof typeof groupExplanations];

          return (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.1 }}
              className="space-y-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-3"
            >
              {/* 组别标题 - 带左侧色条增强层级 */}
              <div
                className={cn(
                  "p-4 rounded-lg relative overflow-hidden",
                  explanation.bgColor
                )}
              >
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-black/10 to-black/0 dark:from-white/10 dark:to-white/0" />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "font-mono font-bold text-xl md:text-2xl",
                          rowInfo.color
                        )}
                      >
                        {rowInfo.label}
                      </div>
                      <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                        {rowInfo.description}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-sm md:text-base font-medium",
                        explanation.color
                      )}
                    >
                      {explanation.title}
                    </div>
                  </div>
                  {/* 添加 trait 和 keywords 信息 */}
                  <div className="flex flex-col md:flex-row gap-2 text-xs">
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">特质：</span>
                      {
                        mbtiGroups[rowInfo.label as keyof typeof mbtiGroups]
                          ?.trait
                      }
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">关键词：</span>
                      {
                        mbtiGroups[rowInfo.label as keyof typeof mbtiGroups]
                          ?.keywords
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* MBTI 类型卡片网格 - 响应式布局 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {row.map((typeCode, colIndex) => {
                  const type = mbtiTypes.find((t) => t.type === typeCode);
                  if (!type) return null;

                  return (
                    <motion.div
                      key={typeCode}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: rowIndex * 0.1 + colIndex * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className={cn(
                        "h-[120px]",
                        selectedType?.type === typeCode ? "z-[100]" : "z-[1]"
                      )}
                    >
                      <MBTICard
                        type={type}
                        isExpanded={selectedType?.type === typeCode}
                        onExpand={() => expandCard(type)}
                        onCollapse={collapseCard}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 布局说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
      >
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">
          布局说明
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <span className="font-semibold">矩阵布局：</span>
            横向为四大MBTI组别（NT分析师、NF外交官、SJ守护者、SP探险家），
            纵向为态度倾向（IJ内向判断、IP内向感知、EJ外向判断、EP外向感知）
          </p>
        </div>
      </motion.div>
    </div>
  );
}
