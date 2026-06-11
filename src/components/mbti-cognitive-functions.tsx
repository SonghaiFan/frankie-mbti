"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { MBTIType } from "@/types/mbti";
import {
  mbtiCard,
  mbtiCardHeader,
  mbtiCardTitle,
  getMbtiColor,
  mbtiMotionStyles,
} from "@/styles/mbti-styles";
import { cn } from "@/lib/utils";
import { cognitiveFunctions } from "@/data/mbti-data";

interface MBTICognitiveFunctionsProps {
  type: MBTIType;
}

export function MBTICognitiveFunctions({ type }: MBTICognitiveFunctionsProps) {
  const colorStyle = getMbtiColor(type.group);
  const userFunctions = type.cognitiveFunctions.split(" ");
  const [expandedFunction, setExpandedFunction] = useState<string | null>(null);
  const [showInference, setShowInference] = useState(false);

  // 主导功能推断逻辑
  const getDominantFunctionInference = () => {
    const mbtiCode = type.type;
    const isExtrovert = mbtiCode[0] === "E";
    const isJudging = mbtiCode[3] === "J";
    const thinkingFeeling = mbtiCode[2];
    const sensingIntuition = mbtiCode[1];

    let step1Logic, step2Logic, dominantFunction;

    if (isExtrovert) {
      if (isJudging) {
        step1Logic = "外向人(E) + 判断型(J) → 主导是外向的判断功能";
        step2Logic = `判断功能优先，根据 ${thinkingFeeling} 决定`;
        dominantFunction = thinkingFeeling === "T" ? "Te" : "Fe";
      } else {
        step1Logic = "外向人(E) + 知觉型(P) → 主导是外向的知觉功能";
        step2Logic = `知觉功能优先，根据 ${sensingIntuition} 决定`;
        dominantFunction = sensingIntuition === "N" ? "Ne" : "Se";
      }
    } else {
      if (isJudging) {
        step1Logic = "内向人(I) + 判断型(J) → 主导是内向的知觉功能";
        step2Logic = `知觉功能优先，根据 ${sensingIntuition} 决定`;
        dominantFunction = sensingIntuition === "N" ? "Ni" : "Si";
      } else {
        step1Logic = "内向人(I) + 知觉型(P) → 主导是内向的判断功能";
        step2Logic = `判断功能优先，根据 ${thinkingFeeling} 决定`;
        dominantFunction = thinkingFeeling === "T" ? "Ti" : "Fi";
      }
    }

    return { step1Logic, step2Logic, dominantFunction, mbtiCode };
  };

  const inference = getDominantFunctionInference();

  // 渲染功能卡片的辅助函数
  const renderFunctionCard = (
    code: string,
    func: {
      name: string;
      description: string;
      icon: string;
      color: string;
      definition: string;
      characteristics: string;
      training: string;
      details: string;
    }
  ) => {
    const userIndex = userFunctions.indexOf(code);
    const isUserFunction = userIndex !== -1;
    const isExpanded = expandedFunction === code;
    const level = isUserFunction ? cognitiveFunctions.levels[userIndex] : null;

    return (
      <motion.div key={code} layout className="space-y-2">
        <motion.div
          layout
          onClick={() => setExpandedFunction(isExpanded ? null : code)}
          className={cn(
            "p-3 rounded-none border-2 border-black transition-all duration-150 relative cursor-pointer shadow-[2px_2px_0px_0px_black] hover:shadow-[4px_4px_0px_0px_black]",
            isUserFunction
              ? cn(
                  userIndex === 0 &&
                    cn(
                      colorStyle.border,
                      colorStyle.bg.split(' ')[0],
                      "border-2 shadow-[3px_3px_0px_0px_black]"
                    ),
                  userIndex === 1 &&
                    cn(
                      colorStyle.border,
                      colorStyle.bg.split(' ')[0],
                      "border-2 shadow-[2px_2px_0px_0px_black]"
                    ),
                  userIndex === 2 &&
                    cn(
                      colorStyle.border,
                      colorStyle.bg.split(' ')[0],
                      "shadow-[1px_1px_0px_0px_black]"
                    ),
                  userIndex === 3 &&
                    cn(
                      colorStyle.border,
                      colorStyle.bg.split(' ')[0],
                      "border-dashed"
                    )
                )
              : "border-black bg-white hover:bg-gray-100"
          )}
        >
          {/* 层级指示器 */}
          {isUserFunction && (
            <div
              className={cn(
                "absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-none border-2 border-black text-xs font-black z-20 shadow-[2px_2px_0px_0px_black]",
                colorStyle.bgDark
              )}
            >
              <span className="text-sm">{level?.icon}</span>
              <span className="font-mono text-xs font-black">
                #{userIndex + 1}
              </span>
            </div>
          )}

          <div className="flex items-start gap-2">
            <span className={cn("text-lg shrink-0", func.color)}>
              {func.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "font-sans font-black px-2 py-0.5 rounded-none border border-black shadow-[1px_1px_0px_0px_black] shrink-0",
                    isUserFunction
                      ? cn(
                          colorStyle.bg.split(' ')[0],
                          colorStyle.text,
                          userIndex === 0 && "text-sm",
                          userIndex === 1 && "text-xs",
                          userIndex === 2 && "text-xs",
                          userIndex === 3 && "text-xs"
                        )
                      : "bg-[#E0E0E0] text-gray-700 text-xs"
                  )}
                >
                  {code}
                </span>
                <span
                  className={cn(
                    "font-black tracking-tighter truncate",
                    isUserFunction
                      ? cn(
                          colorStyle.text,
                          userIndex === 0 && "text-base font-black",
                          userIndex === 1 && "text-sm font-extrabold",
                          userIndex === 2 && "text-sm",
                          userIndex === 3 && "text-sm"
                        )
                      : "text-gray-600 text-sm"
                  )}
                >
                  {func.name}
                </span>
              </div>

              <p
                className={cn(
                  "text-xs leading-relaxed mb-2 font-bold",
                  isUserFunction
                    ? "text-gray-800"
                    : "text-gray-500"
                )}
              >
                {func.description}
              </p>

              {/* 层级名称（用户功能） */}
              {isUserFunction && (
                <div className="flex items-center gap-2 text-[10px] font-bold border-t border-black/10 pt-1.5">
                  <span className="text-gray-600">
                    {level?.name}
                  </span>
                  <span className={cn("font-black uppercase tracking-tighter", colorStyle.text)}>
                    {level?.description}
                  </span>
                </div>
              )}

              {/* 展开指示器 */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-dashed border-black/10">
                <span className="text-[10px] text-gray-500 font-bold">
                  {isExpanded ? "点击收起详情 / COLLAPSE" : "点击查看详情 / EXPAND"}
                </span>
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="text-black text-[10px] font-black"
                >
                  ▼
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 展开的详细信息 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "p-4 rounded-none border-2 border-black space-y-3 shadow-[3px_3px_0px_0px_black] bg-white text-[#121212]"
                )}
              >
                {/* 定义 */}
                <div>
                  <h5
                    className={cn("font-black uppercase tracking-tighter text-xs border-b border-black pb-0.5 mb-1.5", colorStyle.text)}
                  >
                    📖 定义 / DEFINITION
                  </h5>
                  <p className="text-xs text-gray-800 leading-relaxed font-bold">
                    {func.definition}
                  </p>
                </div>

                {/* 特征 */}
                <div>
                  <h5
                    className={cn("font-black uppercase tracking-tighter text-xs border-b border-black pb-0.5 mb-1.5", colorStyle.text)}
                  >
                    ✨ 特征 / CHARACTERISTICS
                  </h5>
                  <p className="text-xs text-gray-800 leading-relaxed font-bold">
                    {func.characteristics}
                  </p>
                </div>

                {/* 培养建议 */}
                <div>
                  <h5
                    className={cn("font-black uppercase tracking-tighter text-xs border-b border-black pb-0.5 mb-1.5", colorStyle.text)}
                  >
                    💡 发展建议 / GROWTH
                  </h5>
                  <p className="text-xs text-gray-800 leading-relaxed font-bold">
                    {func.training}
                  </p>
                </div>

                {/* 详细说明 */}
                <div>
                  <h5
                    className={cn("font-black uppercase tracking-tighter text-xs border-b border-black pb-0.5 mb-1.5", colorStyle.text)}
                  >
                    🔍 细节 / DETAILS
                  </h5>
                  <p className="text-xs text-gray-800 leading-relaxed font-bold">
                    {func.details}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      {...mbtiMotionStyles}
      className={cn(mbtiCard, colorStyle.border)}
    >
      <motion.div
        {...mbtiMotionStyles}
        className={cn(mbtiCardHeader, "py-3 bg-[#E0E0E0] border-b-4 border-black")}
      >
        <motion.h3
          {...mbtiMotionStyles}
          className={cn(mbtiCardTitle, "!text-black")}
        >
          🧠 {cognitiveFunctions.description.title} / COGNITIVE FUNCTIONS
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className="p-4 space-y-6 bg-[#F0F0F0] dot-grid">
        {/* 总体说明 */}
        <div
          className="p-4 rounded-none border-4 border-black bg-white shadow-[4px_4px_0px_0px_black]"
        >
          <p className="text-xs sm:text-sm text-gray-800 font-bold leading-relaxed">
            {cognitiveFunctions.description.content}
          </p>
        </div>

        {/* 主导功能推断层级 */}
        <motion.div
          layout
          className="border-4 border-black rounded-none overflow-hidden shadow-[4px_4px_0px_0px_black]"
        >
          <motion.div
            layout
            onClick={() => setShowInference(!showInference)}
            className="p-4 cursor-pointer bg-white transition-colors duration-150 hover:bg-gray-50 border-b-2 border-black"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔍</span>
                <div>
                  <h4 className="font-black text-sm text-black uppercase tracking-tighter">
                    主导功能两步推断法 / COGNITIVE DEDUCTION
                  </h4>
                  <p className="text-xs text-gray-700 font-bold mt-0.5">
                    了解如何通过 MBTI 字母代码 {inference.mbtiCode} 逆向推导出主导认知功能 {inference.dominantFunction}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: showInference ? 180 : 0 }}
                className="text-black font-black text-sm"
              >
                ▼
              </motion.div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showInference && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden bg-[#F0F0F0]"
              >
                <div className="p-4 border-t border-black">
                  <div className="space-y-4">
                    {/* MBTI代码分解 */}
                    <div>
                      <h5
                        className="font-black text-xs uppercase tracking-tighter mb-2 text-black"
                      >
                        📋 MBTI 维度代码分解 / DECOMPOSITION
                      </h5>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {inference.mbtiCode.split("").map((letter, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-2 rounded-none border-2 border-black font-sans font-black text-lg shadow-[2px_2px_0px_0px_black] bg-white"
                          >
                            <div className={cn("text-xl", colorStyle.text)}>
                              {letter}
                            </div>
                            <div className="text-[10px] text-gray-700 font-black mt-1">
                              {index === 0 && (letter === "E" ? "外向人" : "内向人")}
                              {index === 1 && (letter === "N" ? "直觉型" : "感觉型")}
                              {index === 2 && (letter === "T" ? "思维型" : "情感型")}
                              {index === 3 && (letter === "J" ? "判断型" : "知觉型")}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* 推断步骤 */}
                    <div>
                      <h5
                        className="font-black text-xs uppercase tracking-tighter mb-2 text-black"
                      >
                        🔄 荣格类型两步推断步骤 / DEDUCTION STEPS
                      </h5>

                      {/* 第一步 */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-3 rounded-none mb-3 border-2 border-black shadow-[2px_2px_0px_0px_black] bg-white"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className="rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 text-white bg-black border-2 border-black"
                          >
                            1
                          </span>
                          <div>
                            <p
                              className="text-xs font-black mb-1 uppercase tracking-tighter text-black"
                            >
                              看 E/I + J/P 组合确定主导功能朝向
                            </p>
                            <p className="text-xs text-gray-800 font-bold leading-relaxed">
                              {inference.step1Logic}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* 第二步 */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-3 rounded-none mb-3 border-2 border-black shadow-[2px_2px_0px_0px_black] bg-white"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className="rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 text-white bg-black border-2 border-black"
                          >
                            2
                          </span>
                          <div>
                            <p
                              className="text-xs font-black mb-1 uppercase tracking-tighter text-black"
                            >
                              从判断/知觉偏好锁定主导功能类型
                            </p>
                            <p className="text-xs text-gray-800 font-bold leading-relaxed">
                              {inference.step2Logic}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* 结果 */}
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-none border-4 border-black text-center shadow-[4px_4px_0px_0px_black] bg-bauhaus-yellow"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <p className="text-[10px] font-black uppercase text-black tracking-wider mb-0.5">
                              推断结果：主导认知功能为
                            </p>
                            <p
                              className="text-2xl font-black font-mono text-black"
                            >
                              {inference.dominantFunction}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 按分类显示所有8个认知功能 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 判断功能 */}
          <div className="space-y-4">
            <div className="border-b-2 border-black pb-2">
              <h4
                className="text-sm font-black uppercase tracking-wider text-black"
              >
                {cognitiveFunctions.categories.judging.title} / JUDGING FUNCTIONS
              </h4>
              <p className="text-[10px] text-gray-700 font-bold leading-relaxed mt-1">
                {cognitiveFunctions.categories.judging.description}
              </p>
            </div>
            <div className="space-y-3">
              {Object.entries(
                cognitiveFunctions.categories.judging.functions
              ).map(([code, func]) => renderFunctionCard(code, func))}
            </div>
          </div>

          {/* 感知功能 */}
          <div className="space-y-4">
            <div className="border-b-2 border-black pb-2">
              <h4
                className="text-sm font-black uppercase tracking-wider text-black"
              >
                {cognitiveFunctions.categories.perceiving.title} / PERCEIVING FUNCTIONS
              </h4>
              <p className="text-[10px] text-gray-700 font-bold leading-relaxed mt-1">
                {cognitiveFunctions.categories.perceiving.description}
              </p>
            </div>
            <div className="space-y-3">
              {Object.entries(
                cognitiveFunctions.categories.perceiving.functions
              ).map(([code, func]) => renderFunctionCard(code, func))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
