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
            "p-3 rounded-lg border transition-all duration-200 relative cursor-pointer hover:shadow-md",
            isUserFunction
              ? cn(
                  userIndex === 0 &&
                    cn(
                      colorStyle.border,
                      colorStyle.bg,
                      "bg-opacity-20 dark:bg-opacity-30 border-2 shadow-md"
                    ),
                  userIndex === 1 &&
                    cn(
                      colorStyle.border,
                      colorStyle.bg,
                      "bg-opacity-15 dark:bg-opacity-25 border-2"
                    ),
                  userIndex === 2 &&
                    cn(
                      colorStyle.border,
                      colorStyle.bg,
                      "bg-opacity-10 dark:bg-opacity-20"
                    ),
                  userIndex === 3 &&
                    cn(
                      colorStyle.border,
                      colorStyle.bg,
                      "bg-opacity-5 dark:bg-opacity-15 border-dashed"
                    )
                )
              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          )}
        >
          {/* 层级指示器 */}
          {isUserFunction && (
            <div
              className={cn(
                "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold z-20 shadow-lg",
                colorStyle.bgDark,
                "text-white"
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
                    "font-mono font-bold px-2 py-0.5 rounded shadow-sm shrink-0",
                    isUserFunction
                      ? cn(
                          colorStyle.bg,
                          colorStyle.text,
                          userIndex === 0 && "text-sm",
                          userIndex === 1 && "text-xs",
                          userIndex === 2 && "text-xs",
                          userIndex === 3 && "text-xs"
                        )
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs"
                  )}
                >
                  {code}
                </span>
                <span
                  className={cn(
                    "font-medium truncate",
                    isUserFunction
                      ? cn(
                          colorStyle.text,
                          userIndex === 0 && "text-base font-semibold",
                          userIndex === 1 && "text-sm font-medium",
                          userIndex === 2 && "text-sm",
                          userIndex === 3 && "text-sm"
                        )
                      : "text-gray-600 dark:text-gray-400 text-sm"
                  )}
                >
                  {func.name}
                </span>
              </div>

              <p
                className={cn(
                  "text-xs leading-relaxed mb-2",
                  isUserFunction
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-500 dark:text-gray-500"
                )}
              >
                {func.description}
              </p>

              {/* 层级名称（用户功能） */}
              {isUserFunction && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {level?.name}
                  </span>
                  <span className={cn("font-medium", colorStyle.text)}>
                    {level?.description}
                  </span>
                </div>
              )}

              {/* 展开指示器 */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {isExpanded ? "点击收起详情" : "点击查看详情"}
                </span>
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="text-gray-400 text-xs"
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
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "p-4 rounded-lg border-l-4 space-y-3",
                  colorStyle.border,
                  "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                )}
              >
                {/* 定义 */}
                <div>
                  <h5
                    className={cn("font-medium text-sm mb-1", colorStyle.text)}
                  >
                    📖 定义
                  </h5>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {func.definition}
                  </p>
                </div>

                {/* 特征 */}
                <div>
                  <h5
                    className={cn("font-medium text-sm mb-1", colorStyle.text)}
                  >
                    ✨ 特征
                  </h5>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {func.characteristics}
                  </p>
                </div>

                {/* 培养建议 */}
                <div>
                  <h5
                    className={cn("font-medium text-sm mb-1", colorStyle.text)}
                  >
                    💡 培养建议
                  </h5>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {func.training}
                  </p>
                </div>

                {/* 详细说明 */}
                <div>
                  <h5
                    className={cn("font-medium text-sm mb-1", colorStyle.text)}
                  >
                    🔍 详细说明
                  </h5>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
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
        className={cn(mbtiCardHeader, colorStyle.bg)}
      >
        <motion.h3
          {...mbtiMotionStyles}
          className={cn(mbtiCardTitle, colorStyle.text)}
        >
          🧠 {cognitiveFunctions.description.title}
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className="p-4 space-y-6">
        {/* 总体说明 */}
        <div
          className={cn(
            "p-4 rounded-lg border",
            colorStyle.border,
            colorStyle.bg,
            "bg-opacity-10"
          )}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {cognitiveFunctions.description.content}
          </p>
        </div>
        {/* 你的功能栈总结 */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div
            className={cn(
              "p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50",
              colorStyle.border
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2 mb-3 font-semibold text-base",
                colorStyle.text
              )}
            >
              🎯 你的认知功能栈
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {userFunctions.map((code, index) => {
                const level = cognitiveFunctions.levels[index];
                return (
                  <div
                    key={code}
                    className={cn(
                      "p-3 rounded-lg border text-center",
                      colorStyle.border,
                      colorStyle.bg,
                      index === 0 && "bg-opacity-25 border-2 shadow-md",
                      index === 1 && "bg-opacity-20 border-2",
                      index === 2 && "bg-opacity-15",
                      index === 3 && "bg-opacity-10 border-dashed"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-lg">{level.icon}</span>
                      <span
                        className={cn(
                          "font-mono font-bold text-sm",
                          colorStyle.text
                        )}
                      >
                        {code}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {level.name.replace(/功能.*/, "")}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              高亮显示的是你的四个主要认知功能，按优先级排序。点击任意功能卡片查看详细说明。
            </p>
          </div>
        </div>

        {/* 按分类显示所有8个认知功能 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 判断功能 */}
          <div className="space-y-4">
            <div>
              <h4
                className={cn("text-base font-semibold mb-1", colorStyle.text)}
              >
                {cognitiveFunctions.categories.judging.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
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
            <div>
              <h4
                className={cn("text-base font-semibold mb-1", colorStyle.text)}
              >
                {cognitiveFunctions.categories.perceiving.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
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
