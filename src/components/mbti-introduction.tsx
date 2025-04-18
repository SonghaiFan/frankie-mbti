"use client";

import { motion } from "framer-motion";
import { MBTIType } from "@/types/mbti";
import { calculateCognitiveFunctions } from "@/lib/utils";

interface MBTIIntroductionProps {
  type: MBTIType;
}

export function MBTIIntroduction({ type }: MBTIIntroductionProps) {
  const { dom } = calculateCognitiveFunctions(type.type);

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
          你可以是 {type.type}，但你的大脑主导功能是 {dom}；
        </motion.p>
        <motion.p
          layout="position"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          —— 性格"是什么"，MBTI 告诉你；
          <br />
          —— 性格"怎么运作"，认知功能告诉你。
        </motion.p>
      </div>
    </motion.div>
  );
}
