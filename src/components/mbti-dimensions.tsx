"use client";

import { motion } from "motion/react";
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
      <h3 className={cn(mbtiCardTitle, "!text-black", "text-xs uppercase tracking-wide")}>
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <motion.span
            key={index}
            {...mbtiMotionStyles}
            className={cn(
              "px-2 py-1 rounded-none border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_black]",
              colorStyle.bg.split(' ')[0],
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
          className={cn(mbtiCardHeader, "py-3 bg-[#E0E0E0] border-b-4 border-black")}
        >
          <motion.h3
            {...mbtiMotionStyles}
            className={cn(mbtiCardTitle, "!text-black")}
          >
            🌟 MBTI 四维解析 / FOUR DIMENSIONS
          </motion.h3>
        </motion.div>

        <motion.div {...mbtiMotionStyles} className="p-4 bg-[#F0F0F0] dot-grid">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {dimensions.map((dimension, index) => {
              const selectedType = mbtiType[index];
              return (
                <motion.div
                  key={dimension.name}
                  {...mbtiMotionStyles}
                  className="space-y-3"
                >
                  <h3 className="font-black text-xs uppercase tracking-wider text-black border-b border-black pb-1">
                    {dimension.name}
                  </h3>
                  <div className="grid gap-3">
                    {dimension.options.map((option) => {
                      const isSelected = option.type === selectedType;
                      return (
                        <motion.div
                          key={option.type}
                          {...mbtiMotionStyles}
                          className={cn(
                            "p-3 rounded-none border-2 border-black transition-all duration-150 shadow-[2px_2px_0px_0px_black]",
                            isSelected
                              ? `${colorStyle.bg.split(' ')[0]} font-black scale-102`
                              : "bg-white text-gray-500",
                            colorStyle.border
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-lg">{option.icon}</span>
                            <span
                              className={cn(
                                "font-black text-xs uppercase tracking-tight",
                                isSelected
                                  ? "text-black"
                                  : "text-gray-500"
                              )}
                            >
                              {option.type} - {option.name}
                            </span>
                          </div>
                          <p
                            className={cn(
                              mbtiCardDescription,
                              "text-[10px] leading-normal font-bold",
                              isSelected ? "text-gray-800" : "text-gray-400"
                            )}
                          >
                            {option.description}
                          </p>
                          <p
                            className={cn(
                              mbtiCardDescription,
                              "text-[9px] mt-1 font-mono font-bold leading-normal",
                              isSelected ? colorStyle.text : "text-gray-400"
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
          className={cn(mbtiCardHeader, "py-3 bg-[#E0E0E0] border-b-4 border-black")}
        >
          <motion.h3
            {...mbtiMotionStyles}
            className={cn(mbtiCardTitle, "!text-black")}
          >
            💫 性格特点 / TRAITS
          </motion.h3>
        </motion.div>

        <motion.div {...mbtiMotionStyles} className="p-4 bg-white">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              {renderTraitList("优点 / STRENGTHS", type.strengths)}
              {renderTraitList("缺点 / WEAKNESSES", type.weaknesses)}
            </div>
            <div className="space-y-4">
              {renderTraitList("表面特征 / SURFACE TRAITS", type.surfaceTraits)}
              {renderTraitList("实际特征 / ACTUAL TRAITS", type.actualTraits)}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {MBTIOfficialMatches(colorStyle, type)}
    </div>
  );
}
