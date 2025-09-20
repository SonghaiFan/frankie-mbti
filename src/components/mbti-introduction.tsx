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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-300"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
          MBTI vs 认知功能
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <motion.p
          layout="position"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          MBTI 是你的人设，认知功能是你大脑的操作系统。
        </motion.p>
        <motion.p
          layout="position"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          你可以是{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {mbtiType}
          </span>
          ，但你的大脑主导功能是{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {cogFuncs}
          </span>
          ；
        </motion.p>
        <motion.p
          layout="position"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          <span className="block">MBTI 揭示你性格的表现形式和特征；</span>
          <span className="block mt-1">
            认知功能解释你思维和行为的内在机制。
          </span>
        </motion.p>
      </div>
    </motion.div>
  );
}
