"use client";

import { motion } from "framer-motion";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import {
  mbtiCard,
  mbtiCardHeader,
  mbtiCardTitle,
  mbtiCardContent,
  mbtiCardDescription,
  getMbtiColor,
  mbtiMotionStyles,
} from "@/styles/mbti-styles";
import { mbtiTypes } from "@/data/mbti-data";
import Image from "next/image";

const dimensions = [
  {
    name: "精力来源",
    options: [
      {
        type: "E",
        name: "外向",
        description: "从外界吸能🔥",
        mnemonic: "E像太阳能板",
        icon: "🌞",
      },
      {
        type: "I",
        name: "内向",
        description: "从独处回血🧘",
        mnemonic: "I像充电宝",
        icon: "🔋",
      },
    ],
  },
  {
    name: "获取信息",
    options: [
      {
        type: "S",
        name: "实感",
        description: "靠五官，脚踏实地🧠",
        mnemonic: "S是实干家",
        icon: "👣",
      },
      {
        type: "N",
        name: "直觉",
        description: "靠脑补，爱想未来💭",
        mnemonic: "N是幻想王",
        icon: "✨",
      },
    ],
  },
  {
    name: "做决定",
    options: [
      {
        type: "T",
        name: "理性",
        description: "看逻辑📊",
        mnemonic: "T是机器人",
        icon: "🤖",
      },
      {
        type: "F",
        name: "情感",
        description: "看感受❤️",
        mnemonic: "F是恋爱脑",
        icon: "💝",
      },
    ],
  },
  {
    name: "生活方式",
    options: [
      {
        type: "J",
        name: "判断",
        description: "有计划爱掌控📅",
        mnemonic: "J是计划狂",
        icon: "📋",
      },
      {
        type: "P",
        name: "感知",
        description: "随性自由派🎈",
        mnemonic: "P是自由魂",
        icon: "🎯",
      },
    ],
  },
];

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
    <div className="space-y-4">
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
            🌟 MBTI 四维解析
          </motion.h3>
        </motion.div>

        <motion.div {...mbtiMotionStyles} className={mbtiCardContent}>
          <div className="grid gap-4 md:grid-cols-2">
            {dimensions.map((dimension, index) => {
              const selectedType = mbtiType[index];
              return (
                <motion.div
                  key={dimension.name}
                  {...mbtiMotionStyles}
                  className="space-y-3"
                >
                  <h3
                    className={cn(mbtiCardTitle, colorStyle.text, "text-base")}
                  >
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
                            "p-3 rounded-lg border transition-all duration-300",
                            colorStyle.border,
                            isSelected
                              ? colorStyle.bg
                              : "bg-white dark:bg-gray-800",
                            isSelected && colorStyle.border
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{option.icon}</span>
                            <span
                              className={cn(
                                "font-bold text-sm",
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
                              "text-sm",
                              isSelected && colorStyle.text
                            )}
                          >
                            {option.description}
                          </p>
                          <p
                            className={cn(
                              mbtiCardDescription,
                              "text-xs mt-1",
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
          className={cn(mbtiCardHeader, colorStyle.bg)}
        >
          <motion.h3
            {...mbtiMotionStyles}
            className={cn(mbtiCardTitle, colorStyle.text)}
          >
            💫 性格特点
          </motion.h3>
        </motion.div>

        <motion.div {...mbtiMotionStyles} className={mbtiCardContent}>
          <div className="space-y-6">
            {renderTraitList("优点", type.strengths)}
            {renderTraitList("缺点", type.weaknesses)}
            {renderTraitList("表面特征", type.surfaceTraits)}
            {renderTraitList("实际特征", type.actualTraits)}
          </div>
        </motion.div>
      </motion.div>

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
            💝 最佳拍档
          </motion.h3>
        </motion.div>

        <motion.div {...mbtiMotionStyles} className={mbtiCardContent}>
          <div className="flex flex-wrap gap-6">
            {type.bestPartners.map((partnerType, index) => {
              const partner = mbtiTypes.find((t) => t.type === partnerType);
              if (!partner) return null;

              return (
                <motion.div
                  key={index}
                  {...mbtiMotionStyles}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-200">
                    <Image
                      src={`/mbti_img/${partner.image}`}
                      alt={partner.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <span
                      className={cn(
                        "text-sm font-medium block",
                        colorStyle.text
                      )}
                    >
                      {partner.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {partner.title}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
