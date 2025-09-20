"use client";

import { motion } from "motion/react";
import { mbtiTypes } from "@/data/mbti-data";
import { MBTICard } from "@/components/mbti-card";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";

// 经典的4x4布局，按照MBTI四大组别排列
const grid4x4Layout = [
  ["INTJ", "INTP", "ENTJ", "ENTP"],
  ["INFJ", "INFP", "ENFJ", "ENFP"],
  ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  ["ISTP", "ISFP", "ESTP", "ESFP"],
];

const rowLabels = [
  { label: "NT", description: "分析师 - 直觉+思维", color: "text-purple-900 dark:text-purple-100" },
  {
    label: "NF",
    description: "外交官 - 直觉+情感",
    color: "text-green-900 dark:text-green-100",
  },
  { label: "SJ", description: "守护者 - 感觉+判断", color: "text-blue-900 dark:text-blue-100" },
  {
    label: "SP",
    description: "探险家 - 感觉+感知",
    color: "text-orange-900 dark:text-orange-100",
  },
];

const colLabels = [
  { label: "IJ", description: "内向判断", color: "text-gray-700 dark:text-gray-300" },
  { label: "IP", description: "内向感知", color: "text-gray-700 dark:text-gray-300" },
  { label: "EJ", description: "外向判断", color: "text-gray-700 dark:text-gray-300" },
  { label: "EP", description: "外向感知", color: "text-gray-700 dark:text-gray-300" },
];

export function Grid4x4View() {
  const selectedType = useMBTIStore((state) => state.selectedType);
  const expandCard = useMBTIStore((state) => state.expandCard);
  const collapseCard = useMBTIStore((state) => state.collapseCard);

  return (
    <div className="mb-8">
      {/* 标题说明 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          MBTI 16型人格经典布局
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          按照认知功能组合的逻辑结构排列，横轴为态度倾向，纵轴为功能偏好
        </p>
      </motion.div>

      <div className="relative">
        {/* 列标签 */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          <div></div> {/* 空白角落 */}
          {colLabels.map((col, index) => (
            <motion.div
              key={col.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-center"
            >
              <div className={cn("font-mono font-bold text-sm", col.color)}>
                {col.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {col.description}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 主网格 */}
        {grid4x4Layout.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2 mb-2">
            {/* 行标签 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.1 }}
              className="flex flex-col items-center justify-center pr-2"
            >
              <div
                className={cn(
                  "font-mono font-bold text-lg",
                  rowLabels[rowIndex].color
                )}
              >
                {rowLabels[rowIndex].label}
              </div>
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 leading-tight">
                {rowLabels[rowIndex].description}
              </div>
            </motion.div>

            {/* MBTI 类型卡片 */}
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
        ))}

        {/* 底部图例 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
        >
          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">
            布局说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <p>
                <strong>纵轴（MBTI四大组别）:</strong>
              </p>
              <ul className="mt-1 space-y-0.5">
                <li>• NT：分析师（直觉+思维）</li>
                <li>• NF：外交官（直觉+情感）</li>
                <li>• SJ：守护者（感觉+判断）</li>
                <li>• SP：探险家（感觉+感知）</li>
              </ul>
            </div>
            <div>
              <p>
                <strong>横轴（态度倾向）:</strong>
              </p>
              <ul className="mt-1 space-y-0.5">
                <li>• IJ：内向+判断（计划型）</li>
                <li>• IP：内向+感知（适应型）</li>
                <li>• EJ：外向+判断（组织型）</li>
                <li>• EP：外向+感知（灵活型）</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
