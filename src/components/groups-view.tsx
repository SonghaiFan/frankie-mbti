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

const colLabels = [
  {
    label: "IJ",
    description: "内向判断",
    color: "text-gray-700 dark:text-gray-300",
  },
  {
    label: "IP",
    description: "内向感知",
    color: "text-gray-700 dark:text-gray-300",
  },
  {
    label: "EJ",
    description: "外向判断",
    color: "text-gray-700 dark:text-gray-300",
  },
  {
    label: "EP",
    description: "外向感知",
    color: "text-gray-700 dark:text-gray-300",
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
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          MBTI 四大组别视图
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">
          按照四大组别和态度倾向的矩阵布局
        </p>
      </motion.div>

      {/* 态度倾向标题行 - 仅桌面端显示（吸顶增强层级） */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hidden sm:grid sm:grid-cols-4 gap-3 mb-4 px-2 sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-900/40"
      >
        {colLabels.map((col) => (
          <div
            key={col.label}
            className="text-center p-2 sm:p-3 bg-gray-100/80 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div
              className={cn(
                "font-mono font-bold text-sm sm:text-base",
                col.color
              )}
            >
              {col.label}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {col.description}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="space-y-4 sm:space-y-6">
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
              className="space-y-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-2 sm:p-3"
            >
              {/* 组别标题 - 带左侧色条增强层级 */}
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-lg relative overflow-hidden",
                  explanation.bgColor
                )}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b from-black/10 to-black/0 dark:from-white/10 dark:to-white/0" />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "font-mono font-bold text-xl sm:text-2xl",
                          rowInfo.color
                        )}
                      >
                        {rowInfo.label}
                      </div>
                      <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {rowInfo.description}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-sm sm:text-base font-medium",
                        explanation.color
                      )}
                    >
                      {explanation.title}
                    </div>
                  </div>
                  {/* 添加 trait 和 keywords 信息 */}
                  <div className="flex flex-col sm:flex-row gap-2 text-xs">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
                        "h-[100px] sm:h-[120px]",
                        selectedType?.type === typeCode ? "z-[100]" : "z-[1]"
                      )}
                    >
                      {/* 移动端角标：显示列态度（IJ/IP/EJ/EP） */}
                      <div className="sm:hidden absolute top-1 left-1 text-[10px] px-1 py-0.5 rounded bg-gray-900/70 text-white">
                        {colLabels[colIndex]?.label}
                      </div>
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
        className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
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
