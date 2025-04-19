"use client";

import { motion } from "framer-motion";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import {
  mbtiCard,
  mbtiCardHeader,
  mbtiCardTitle,
  getMbtiColor,
  mbtiMotionStyles,
} from "@/styles/mbti-styles";
import { mbtiMatches, mbtiTypes } from "@/data/mbti-data";
import Image from "next/image";
import { useMBTIStore } from "@/store/mbti-store";

interface MBTIMatchesProps {
  type: MBTIType;
}

export function MBTIMatches({ type }: MBTIMatchesProps) {
  const colorStyle = getMbtiColor(type.group);
  const { setSelectedType } = useMBTIStore();

  // 找到当前类型相关的所有配对
  const relevantMatches = mbtiMatches.filter((match) =>
    match.pair.includes(type.type)
  );

  const getMatchPartner = (match: (typeof mbtiMatches)[0]) => {
    const partnerId =
      match.pair[0] === type.type ? match.pair[1] : match.pair[0];
    return mbtiTypes.find((t) => t.type === partnerId);
  };

  // 合并相似的匹配模式
  const combinedMatches = relevantMatches.reduce(
    (acc, match) => {
      const partner = getMatchPartner(match);
      if (!partner) return acc;

      const key = `${type.cognitiveFunctions}-${partner.cognitiveFunctions}`;
      if (!acc[key]) {
        acc[key] = {
          partner,
          matches: [],
          uniqueNames: new Set<string>(),
        };
      }
      acc[key].matches.push(match);
      acc[key].uniqueNames.add(match.name);
      return acc;
    },
    {} as Record<
      string,
      {
        partner: (typeof mbtiTypes)[0];
        matches: typeof mbtiMatches;
        uniqueNames: Set<string>;
      }
    >
  );

  return (
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
          💕 最佳拍档（认知功能）
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className="p-3">
        <div className="space-y-3">
          {Object.values(combinedMatches).map(
            ({ partner, matches, uniqueNames }, index) => (
              <motion.div
                key={index}
                {...mbtiMotionStyles}
                className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                  <div
                    className="flex flex-row md:flex-col items-center gap-2 w-full md:w-[120px] cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedType(type)}
                  >
                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                      <Image
                        src={`/mbti_img/${type.image}`}
                        alt={type.title}
                        fill
                        sizes="(max-width: 768px) 40px, 48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate">
                        {type.type}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {type.cognitiveFunctions}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-full md:w-[160px] px-2">
                    <span className="text-sm font-bold text-pink-500 text-center line-clamp-1">
                      {Array.from(uniqueNames).join("；")}
                    </span>
                    <span className="text-xs text-gray-500 text-center line-clamp-1">
                      {matches.map((m) => m.matchType).join("；")}
                    </span>
                  </div>

                  <div
                    className="flex flex-row md:flex-col items-center gap-2 w-full md:w-[120px] cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedType(partner)}
                  >
                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                      <Image
                        src={`/mbti_img/${partner.image}`}
                        alt={partner.title}
                        fill
                        sizes="(max-width: 768px) 40px, 48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate">
                        {partner.type}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {partner.cognitiveFunctions}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:flex-1 mt-3 md:mt-0 md:pl-4 md:border-l md:border-gray-200 dark:md:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {matches.map((m) => m.description).join("；")}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MBTIOfficialMatches(
  colorStyle: {
    bg: string;
    bgDark: string;
    text: string;
    border: string;
    hover: string;
  },
  type: MBTIType
) {
  const { setSelectedType } = useMBTIStore();

  return (
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
          💝 最佳拍档（MBTI官配）
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {type.bestPartners.map((partnerType, index) => {
            const partner = mbtiTypes.find((t) => t.type === partnerType);
            if (!partner) return null;

            return (
              <motion.div
                key={index}
                {...mbtiMotionStyles}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedType(partner)}
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-200">
                  <Image
                    src={`/mbti_img/${partner.image}`}
                    alt={partner.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span
                    className={cn("text-sm font-medium block", colorStyle.text)}
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
  );
}
