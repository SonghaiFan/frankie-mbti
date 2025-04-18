"use client";

import { motion } from "framer-motion";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import {
  mbtiCard,
  mbtiCardHeader,
  mbtiCardTitle,
  mbtiCardContent,
  getMbtiColor,
  mbtiMotionStyles,
} from "@/styles/mbti-styles";
import { mbtiMatches, mbtiTypes } from "@/data/mbti-data";
import Image from "next/image";

interface MBTIMatchesProps {
  type: MBTIType;
}

export function MBTIMatches({ type }: MBTIMatchesProps) {
  const colorStyle = getMbtiColor(type.group);

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
        className={cn(mbtiCardHeader, colorStyle.bg)}
      >
        <motion.h3
          {...mbtiMotionStyles}
          className={cn(mbtiCardTitle, colorStyle.text)}
        >
          💕 最佳拍档（认知功能）
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className={mbtiCardContent}>
        <div className="space-y-6">
          {Object.values(combinedMatches).map(
            ({ partner, matches, uniqueNames }, index) => (
              <motion.div
                key={index}
                {...mbtiMotionStyles}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <Image
                        src={`/mbti_img/${type.image}`}
                        alt={type.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{type.type}</span>
                    <span className="text-xs text-gray-500">
                      {type.cognitiveFunctions}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-pink-500">
                      {Array.from(uniqueNames).join("；")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {matches.map((m) => m.matchType).join("；")}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <Image
                        src={`/mbti_img/${partner.image}`}
                        alt={partner.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{partner.type}</span>
                    <span className="text-xs text-gray-500">
                      {partner.cognitiveFunctions}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
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
