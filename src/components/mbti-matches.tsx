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
                  <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-[120px]">
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

                  <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-[120px]">
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
