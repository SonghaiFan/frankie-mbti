"use client";

import { motion } from "motion/react";
import { MBTIType } from "@/types/mbti";
import { mbtiTypes } from "@/data/mbti-data";

interface MBTIIntroductionProps {
  type: MBTIType;
}

export function MBTIIntroduction({ type }: MBTIIntroductionProps) {
  const mbtiType = type.type;
  const cogFuncs = mbtiTypes
    .find((t) => t.type === mbtiType)
    ?.cognitiveFunctions.split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white border-4 border-black rounded-none shadow-[6px_6px_0px_0px_black] overflow-hidden text-[#121212]"
    >
      <div className="p-4 border-b-4 border-black bg-[#E0E0E0]">
        <h3 className="text-sm font-black uppercase tracking-wider text-black">
          MBTI 性格 vs 认知功能 / CONCEPTS
        </h3>
      </div>
      <div className="p-4 space-y-3 font-sans">
        <motion.p
          layout="position"
          className="text-xs text-gray-800 font-bold leading-relaxed"
        >
          MBTI 是你性格的“人设”，而认知功能则是你大脑底层的“操作系统”。
        </motion.p>
        <motion.p
          layout="position"
          className="text-xs text-gray-800 font-medium leading-relaxed"
        >
          你是{" "}
          <span className="font-black text-black underline decoration-4 decoration-[#D02020]">
            {mbtiType}
          </span>
          ，这代表着你的表现特征；而你的大脑核心主导功能是{" "}
          <span className="font-black text-black underline decoration-4 decoration-[#1040C0]">
            {cogFuncs}
          </span>
          ，这解释了你思维的内在运作机制。
        </motion.p>
      </div>
    </motion.div>
  );
}
