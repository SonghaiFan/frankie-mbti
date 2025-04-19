"use client";

import { motion } from "framer-motion";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import {
  mbtiCard,
  mbtiCardHeader,
  mbtiCardTitle,
  mbtiCardDescription,
  getMbtiColor,
  mbtiMotionStyles,
} from "@/styles/mbti-styles";
import { dimensions } from "@/data/mbti-data";
import { MBTIOfficialMatches } from "./mbti-matches";

interface MBTIDimensionsProps {
  type: MBTIType;
}

export function MBTIDimensions({ type }: MBTIDimensionsProps) {
  const colorStyle = getMbtiColor(type.group);
  const mbtiType = type.type.split("");

  const renderTraitList = (title: string, items: string[]) => (
    <motion.div {...mbtiMotionStyles} className="space-y-2">
      <h3 className={cn(mbtiCardTitle, colorStyle.text, "text-base")}>
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <motion.span
            key={index}
            {...mbtiMotionStyles}
            className={cn(
              "px-2 py-1 rounded-full text-xs",
              colorStyle.bg,
              colorStyle.text
            )}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-3">
      <motion.div
        {...mbtiMotionStyles}
        className={cn(mbtiCard, colorStyle.border)}
      >
        <motion.div
          {...mbtiMotionStyles}
          className={cn(mbtiCardHeader, "py-2", colorStyle.bg)}
        >
          <motion.h3
            {...mbtiMotionStyles}
            className={cn(mbtiCardTitle, colorStyle.text)}
          >
            🌟 MBTI 四维解析
          </motion.h3>
        </motion.div>

        <motion.div {...mbtiMotionStyles} className="p-3">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {dimensions.map((dimension, index) => {
              const selectedType = mbtiType[index];
              return (
                <motion.div
                  key={dimension.name}
                  {...mbtiMotionStyles}
                  className="space-y-2"
                >
                  <h3 className={cn(mbtiCardTitle, colorStyle.text, "text-sm")}>
                    {dimension.name}
                  </h3>
                  <div className="grid gap-2">
                    {dimension.options.map((option) => {
                      const isSelected = option.type === selectedType;
                      return (
                        <motion.div
                          key={option.type}
                          {...mbtiMotionStyles}
                          className={cn(
                            "p-2 rounded-lg border transition-all duration-300",
                            colorStyle.border,
                            isSelected
                              ? colorStyle.bg
                              : "bg-white dark:bg-gray-800",
                            isSelected && colorStyle.border
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-lg">{option.icon}</span>
                            <span
                              className={cn(
                                "font-medium text-sm",
                                isSelected
                                  ? colorStyle.text
                                  : "text-gray-900 dark:text-gray-100"
                              )}
                            >
                              {option.type} - {option.name}
                            </span>
                          </div>
                          <p
                            className={cn(
                              mbtiCardDescription,
                              "text-xs",
                              isSelected && colorStyle.text
                            )}
                          >
                            {option.description}
                          </p>
                          <p
                            className={cn(
                              mbtiCardDescription,
                              "text-xs mt-0.5",
                              isSelected && colorStyle.text
                            )}
                          >
                            {option.mnemonic}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        {...mbtiMotionStyles}
        className={cn(mbtiCard, colorStyle.border)}
      >
        <motion.div
          {...mbtiMotionStyles}
          className={cn(mbtiCardHeader, "py-2", colorStyle.bg)}
        >
          <motion.h3
            {...mbtiMotionStyles}
            className={cn(mbtiCardTitle, colorStyle.text)}
          >
            💫 性格特点
          </motion.h3>
        </motion.div>

        <motion.div {...mbtiMotionStyles} className="p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3">
              {renderTraitList("优点", type.strengths)}
              {renderTraitList("缺点", type.weaknesses)}
            </div>
            <div className="space-y-3">
              {renderTraitList("表面特征", type.surfaceTraits)}
              {renderTraitList("实际特征", type.actualTraits)}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {MBTIOfficialMatches(colorStyle, type)}
    </div>
  );
}
