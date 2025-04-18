"use client";

import { motion } from "framer-motion";
import { MBTIType } from "@/types/mbti";
import { cognitiveFunctions } from "@/data/mbti-data";

interface MBTICognitiveIntroProps {
  type: MBTIType;
}

export function MBTICognitiveIntro({ type }: MBTICognitiveIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            🧠 认知功能简介
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            每个 MBTI 类型都有四个认知功能，按照使用频率和熟练度排序：
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {cognitiveFunctions.levels.map((func, index) => (
              <motion.div
                key={func.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{func.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {func.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {func.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            🎯 八种认知功能
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            认知功能分为判断（T/F）和感知（S/N）两类，每类都有内向（i）和外向（e）两种方向：
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(cognitiveFunctions.types).map(
              ([type, func], index) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{func.icon}</span>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {type}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        {func.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {func.description}
                  </p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
