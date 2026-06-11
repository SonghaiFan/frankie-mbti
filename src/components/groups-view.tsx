"use client";

import { motion } from "motion/react";
import { mbtiTypes, groupExplanations, mbtiGroups } from "@/data/mbti-data";
import { MBTICard } from "@/components/mbti-card";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";
import { getMbtiColor } from "@/styles/mbti-styles";

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
    group: "分析师",
  },
  {
    label: "NF",
    description: "外交官 - 直觉+情感",
    group: "外交官",
  },
  {
    label: "SJ",
    description: "守护者 - 感觉+判断",
    group: "守护者",
  },
  {
    label: "SP",
    description: "探险家 - 感觉+感知",
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
        className="text-left mb-6 border-b-4 border-black pb-4"
      >
        <span className="bg-bauhaus-red text-white text-xs font-bold px-2.5 py-1 tracking-widest uppercase inline-block mb-2">CATEGORY CLASSIFICATION</span>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">
          MBTI 四大组别视图
        </h2>
        <p className="text-sm text-gray-700 font-medium mt-1">
          按照四大基本组别的平面平面网格矩阵布局进行展示
        </p>
      </motion.div>

      <div className="space-y-8">
        {enhancedGroupLayout.map((row, rowIndex) => {
          const rowInfo = rowLabels[rowIndex];
          const explanation =
            groupExplanations[rowInfo.group as keyof typeof groupExplanations];
          const colorStyle = getMbtiColor(rowInfo.label);

          return (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.1 }}
              className="space-y-4 rounded-none border-4 border-black bg-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(18,18,18,1)] text-left"
            >
              {/* 组别标题 - 采用高饱和度色块包豪斯条形 */}
              <div
                className={cn(
                  "p-4 border-4 border-black rounded-none relative overflow-hidden",
                  colorStyle.bgDark
                )}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="font-sans font-black text-lg md:text-xl bg-black text-white px-3 py-0.5 tracking-widest">
                        {rowInfo.label}
                      </div>
                      <div className="text-sm md:text-base font-bold uppercase tracking-wide">
                        {rowInfo.description}
                      </div>
                    </div>
                    <div className="text-sm md:text-base font-black uppercase tracking-wider">
                      {explanation.title}
                    </div>
                  </div>
                  {/* 添加 trait 和 keywords 信息 */}
                  <div className="flex flex-col sm:flex-row gap-4 text-xs font-bold uppercase tracking-wider pt-2 border-t border-current/20">
                    <div>
                      <span className="opacity-70 mr-1.5">[特质]</span>
                      {mbtiGroups[rowInfo.label as keyof typeof mbtiGroups]?.trait}
                    </div>
                    <div>
                      <span className="opacity-70 mr-1.5">[关键词]</span>
                      {mbtiGroups[rowInfo.label as keyof typeof mbtiGroups]?.keywords}
                    </div>
                  </div>
                </div>
              </div>

              {/* MBTI 类型卡片网格 - 响应式布局 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {row.map((typeCode, colIndex) => {
                  const type = mbtiTypes.find((t) => t.type === typeCode);
                  if (!type) return null;

                  return (
                    <motion.div
                      key={typeCode}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: rowIndex * 0.1 + colIndex * 0.05,
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
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
        transition={{ delay: 0.5 }}
        className="mt-12 p-6 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_0px_black] text-left"
      >
        <h3 className="font-black tracking-widest text-sm uppercase text-gray-900 border-b-2 border-black pb-2 mb-3">
          LAYOUT SPECIFICATION / 布局说明
        </h3>
        <div className="text-xs sm:text-sm text-gray-800 font-medium space-y-2 leading-relaxed">
          <p>
            <span className="font-black bg-[#F0C020] text-black px-1 mr-1.5">[平面矩阵]</span>
            横向网格为四大包豪斯色彩划分组别（NT 分析师-紫色、NF 外交官-绿色、SJ 守护者-蓝色、SP 探险家-黄色），
            纵向网格为四种心智态度倾向（IJ 内向判断、IP 内向感知、EJ 外向判断、EP 外向感知）。
          </p>
        </div>
      </motion.div>
    </div>
  );
}

