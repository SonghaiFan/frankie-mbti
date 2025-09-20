"use client";

import { motion } from "motion/react";
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
          🧠 认知功能栈
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className="p-4 space-y-4">
        {/* 所有8个认知功能，按分类显示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 判断功能 */}
          <div className="space-y-3">
            <h4 className={cn("text-sm font-medium", colorStyle.text)}>
              {cognitiveFunctions.categories.judging.title}
            </h4>
            <div className="space-y-2">
              {Object.entries(
                cognitiveFunctions.categories.judging.functions
              ).map(([code, func]) => {
                const userIndex = userFunctions.indexOf(code);
                const isUserFunction = userIndex !== -1;
                const level = isUserFunction
                  ? cognitiveFunctions.levels[userIndex]
                  : null;

                return (
                  <motion.div
                    key={code}
                    {...mbtiMotionStyles}
                    className="space-y-2"
                  >
                    {/* 功能卡片 */}
                    <div
                      className={cn(
                        "p-3 rounded-lg border transition-all duration-200 relative",
                        isUserFunction
                          ? cn(
                              // 根据层级调整边框和背景强度
                              userIndex === 0 &&
                                cn(
                                  colorStyle.border,
                                  colorStyle.bg,
                                  "bg-opacity-20 dark:bg-opacity-30 border-2 shadow-md"
                                ), // 主导功能 - 最显眼
                              userIndex === 1 &&
                                cn(
                                  colorStyle.border,
                                  colorStyle.bg,
                                  "bg-opacity-15 dark:bg-opacity-25 border-2"
                                ), // 辅助功能
                              userIndex === 2 &&
                                cn(
                                  colorStyle.border,
                                  colorStyle.bg,
                                  "bg-opacity-10 dark:bg-opacity-20"
                                ), // 第三功能
                              userIndex === 3 &&
                                cn(
                                  colorStyle.border,
                                  colorStyle.bg,
                                  "bg-opacity-5 dark:bg-opacity-15 border-dashed"
                                ) // 劣势功能 - 虚线边框
                            )
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
                      )}
                    >
                      {/* 用户功能栈层级指示器 - 右上角徽章 */}
                      {isUserFunction && (
                        <div
                          className={cn(
                            "absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold z-20 shadow-lg",
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
                        <span className={cn("text-lg", func.color)}>
                          {func.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "font-mono font-bold px-2 py-0.5 rounded shadow-sm",
                                isUserFunction
                                  ? cn(
                                      colorStyle.bg,
                                      colorStyle.text,
                                      // 根据层级调整代码标签的大小
                                      userIndex === 0 && "text-sm", // 主导功能 - 最大
                                      userIndex === 1 && "text-xs", // 辅助功能
                                      userIndex === 2 && "text-xs", // 第三功能
                                      userIndex === 3 && "text-xs" // 劣势功能
                                    )
                                  : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs"
                              )}
                            >
                              {code}
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                isUserFunction
                                  ? cn(
                                      colorStyle.text,
                                      // 根据层级调整文字大小
                                      userIndex === 0 &&
                                        "text-base font-semibold", // 主导功能 - 最大最粗
                                      userIndex === 1 && "text-sm font-medium", // 辅助功能
                                      userIndex === 2 && "text-sm", // 第三功能
                                      userIndex === 3 && "text-sm" // 劣势功能
                                    )
                                  : "text-gray-600 dark:text-gray-400 text-sm"
                              )}
                            >
                              {func.name}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-xs leading-relaxed",
                              isUserFunction
                                ? "text-gray-700 dark:text-gray-300"
                                : "text-gray-500 dark:text-gray-500"
                            )}
                          >
                            {func.description}
                          </p>

                          {/* 用户功能的熟练度 */}
                          {isUserFunction && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {level?.name}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    colorStyle.text
                                  )}
                                >
                                  {["精通", "熟练", "进阶", "入门"][userIndex]}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden",
                                  // 根据层级调整进度条高度
                                  userIndex === 0 && "h-2", // 主导功能 - 最粗
                                  userIndex === 1 && "h-1.5", // 辅助功能
                                  userIndex === 2 && "h-1.5", // 第三功能
                                  userIndex === 3 && "h-1" // 劣势功能 - 最细
                                )}
                              >
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    colorStyle.bgDark
                                  )}
                                  style={{
                                    width: ["80%", "60%", "40%", "20%"][
                                      userIndex
                                    ],
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 感知功能 */}
          <div className="space-y-3">
            <h4 className={cn("text-sm font-medium", colorStyle.text)}>
              {cognitiveFunctions.categories.perceiving.title}
            </h4>
            <div className="space-y-2">
              {Object.entries(
                cognitiveFunctions.categories.perceiving.functions
              ).map(([code, func]) => {
                const userIndex = userFunctions.indexOf(code);
                const isUserFunction = userIndex !== -1;
                const level = isUserFunction
                  ? cognitiveFunctions.levels[userIndex]
                  : null;

                return (
                  <motion.div
                    key={code}
                    {...mbtiMotionStyles}
                    className="space-y-2"
                  >
                    {/* 功能卡片 */}
                    <div
                      className={cn(
                        "p-3 rounded-lg border transition-all duration-200 relative",
                        isUserFunction
                          ? cn(
                              // 根据层级调整边框和背景强度
                              userIndex === 0 &&
                                cn(
                                  colorStyle.border,
                                  colorStyle.bg,
                                  "bg-opacity-20 dark:bg-opacity-30 border-2 shadow-md"
                                ), // 主导功能 - 最显眼
                              userIndex === 1 &&
                                cn(
                                  colorStyle.border,
                                  colorStyle.bg,
                                  "bg-opacity-15 dark:bg-opacity-25 border-2"
                                ), // 辅助功能
                              userIndex === 2 &&
                                cn(
                                  colorStyle.border,
                                  colorStyle.bg,
                                  "bg-opacity-10 dark:bg-opacity-20"
                                ), // 第三功能
                              userIndex === 3 &&
                                cn(
                                  colorStyle.border,
                                  colorStyle.bg,
                                  "bg-opacity-5 dark:bg-opacity-15 border-dashed"
                                ) // 劣势功能 - 虚线边框
                            )
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
                      )}
                    >
                      {/* 用户功能栈层级指示器 - 右上角徽章 */}
                      {isUserFunction && (
                        <div
                          className={cn(
                            "absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold z-20 shadow-lg",
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
                        <span className={cn("text-lg", func.color)}>
                          {func.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "font-mono font-bold px-2 py-0.5 rounded shadow-sm",
                                isUserFunction
                                  ? cn(
                                      colorStyle.bg,
                                      colorStyle.text,
                                      // 根据层级调整代码标签的大小
                                      userIndex === 0 && "text-sm", // 主导功能 - 最大
                                      userIndex === 1 && "text-xs", // 辅助功能
                                      userIndex === 2 && "text-xs", // 第三功能
                                      userIndex === 3 && "text-xs" // 劣势功能
                                    )
                                  : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs"
                              )}
                            >
                              {code}
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                isUserFunction
                                  ? cn(
                                      colorStyle.text,
                                      // 根据层级调整文字大小
                                      userIndex === 0 &&
                                        "text-base font-semibold", // 主导功能 - 最大最粗
                                      userIndex === 1 && "text-sm font-medium", // 辅助功能
                                      userIndex === 2 && "text-sm", // 第三功能
                                      userIndex === 3 && "text-sm" // 劣势功能
                                    )
                                  : "text-gray-600 dark:text-gray-400 text-sm"
                              )}
                            >
                              {func.name}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-xs leading-relaxed",
                              isUserFunction
                                ? "text-gray-700 dark:text-gray-300"
                                : "text-gray-500 dark:text-gray-500"
                            )}
                          >
                            {func.description}
                          </p>

                          {/* 用户功能的熟练度 */}
                          {isUserFunction && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {level?.name}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    colorStyle.text
                                  )}
                                >
                                  {["精通", "熟练", "进阶", "入门"][userIndex]}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden",
                                  // 根据层级调整进度条高度
                                  userIndex === 0 && "h-2", // 主导功能 - 最粗
                                  userIndex === 1 && "h-1.5", // 辅助功能
                                  userIndex === 2 && "h-1.5", // 第三功能
                                  userIndex === 3 && "h-1" // 劣势功能 - 最细
                                )}
                              >
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    colorStyle.bgDark
                                  )}
                                  style={{
                                    width: ["80%", "60%", "40%", "20%"][
                                      userIndex
                                    ],
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 功能栈说明 */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("font-medium text-sm", colorStyle.text)}>
                你的认知功能栈：{userFunctions.join(" → ")}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              高亮显示的是你的四个主要认知功能，按优先级排序。其他功能为你较少使用的功能。
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
