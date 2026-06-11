"use client";

import { motion } from "motion/react";
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
        className={cn(mbtiCardHeader, "py-3 bg-[#E0E0E0] border-b-4 border-black")}
      >
        <motion.h3
          {...mbtiMotionStyles}
          className={cn(mbtiCardTitle, "!text-black")}
        >
          🤗 认知功能拍档 / COGNITIVE PARTNERS
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className="p-4 bg-[#F0F0F0]">
        <div className="space-y-4">
          {Object.values(combinedMatches).map(
            ({ partner, matches, uniqueNames }, index) => (
              <motion.div
                key={index}
                {...mbtiMotionStyles}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-none border-4 border-black bg-white shadow-[4px_4px_0px_0px_black]"
              >
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                  {/* Left Partner */}
                  <div
                    className="flex flex-row md:flex-col items-center gap-3 w-full md:w-[120px] cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedType(type)}
                  >
                    <div className="relative w-12 h-12 rounded-none overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_black] flex-none">
                      <Image
                        src={`/mbti_img/${type.image}`}
                        alt={type.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black uppercase tracking-tighter truncate">
                        {type.type}
                      </span>
                      <span className="text-[10px] text-gray-600 font-bold font-mono truncate">
                        {type.cognitiveFunctions}
                      </span>
                    </div>
                  </div>

                  {/* Matching Info Badge */}
                  <div className="flex flex-col items-center w-full md:w-[160px] py-2 px-3 border-2 border-dashed border-black bg-gray-50">
                    <span className="text-xs font-black text-[#D02020] text-center line-clamp-1 uppercase tracking-tight">
                      {Array.from(uniqueNames).join("；")}
                    </span>
                    <span className="text-[10px] text-black font-extrabold text-center mt-1 uppercase tracking-tighter">
                      {matches.map((m) => m.matchType).join("；")}
                    </span>
                  </div>

                  {/* Right Partner */}
                  <div
                    className="flex flex-row md:flex-col items-center gap-3 w-full md:w-[120px] cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedType(partner)}
                  >
                    <div className="relative w-12 h-12 rounded-none overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_black] flex-none">
                      <Image
                        src={`/mbti_img/${partner.image}`}
                        alt={partner.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black uppercase tracking-tighter truncate">
                        {partner.type}
                      </span>
                      <span className="text-[10px] text-gray-600 font-bold font-mono truncate">
                        {partner.cognitiveFunctions}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:flex-1 mt-3 md:mt-0 md:pl-4 md:border-l-4 md:border-black">
                  <p className="text-xs text-gray-800 leading-relaxed font-bold">
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
        className={cn(mbtiCardHeader, "py-3 bg-[#E0E0E0] border-b-4 border-black")}
      >
        <motion.h3
          {...mbtiMotionStyles}
          className={cn(mbtiCardTitle, "!text-black")}
        >
          🥰 官方最佳拍档 / MBTI OFFICIAL MATCHES
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className="p-4 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {type.bestPartners.map((partnerType, index) => {
            const partner = mbtiTypes.find((t) => t.type === partnerType);
            if (!partner) return null;

            return (
              <motion.div
                key={index}
                {...mbtiMotionStyles}
                className="flex items-center gap-3 cursor-pointer p-2 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_black] hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedType(partner)}
              >
                <div className="relative w-12 h-12 rounded-none overflow-hidden border border-black shadow-[1px_1px_0px_0px_black] flex-none">
                  <Image
                    src={`/mbti_img/${partner.image}`}
                    alt={partner.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span
                    className={cn("text-xs font-black uppercase tracking-tighter block", colorStyle.text)}
                  >
                    {partner.type}
                  </span>
                  <span className="text-[10px] text-gray-700 font-bold block truncate">
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
