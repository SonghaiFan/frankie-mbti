"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { MBTIType } from "@/types/mbti";
import { mbtiTypes } from "@/data/mbti-data";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";
import { MBTIState } from "@/store/mbti-store";
import { MBTICard } from "@/components/mbti-card";

const questions = [
  {
    dimension: "E/I",
    question: "在社交场合中，你通常：",
    options: [
      {
        type: "E",
        text: "主动与他人交流，享受成为焦点",
        icon: "🌞",
      },
      {
        type: "I",
        text: "倾向于倾听，更喜欢一对一的交流",
        icon: "🌙",
      },
    ],
  },
  {
    dimension: "S/N",
    question: "当学习新事物时，你更倾向于：",
    options: [
      {
        type: "S",
        text: "关注具体事实和细节",
        icon: "📊",
      },
      {
        type: "N",
        text: "关注整体概念和可能性",
        icon: "💡",
      },
    ],
  },
  {
    dimension: "T/F",
    question: "做决定时，你更注重：",
    options: [
      {
        type: "T",
        text: "逻辑分析和客观标准",
        icon: "⚖️",
      },
      {
        type: "F",
        text: "个人价值观和他人感受",
        icon: "❤️",
      },
    ],
  },
  {
    dimension: "J/P",
    question: "在日常生活中，你更喜欢：",
    options: [
      {
        type: "J",
        text: "有计划、有组织的方式",
        icon: "📅",
      },
      {
        type: "P",
        text: "灵活、随性的方式",
        icon: "🎯",
      },
    ],
  },
];

export function MBTITest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<MBTIType | null>(null);
  const expandCard = useMBTIStore((state: MBTIState) => state.expandCard);

  const handleAnswer = (dimension: string, type: string) => {
    setAnswers((prev) => ({ ...prev, [dimension]: type }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const mbtiType = Object.values(answers).join("") + type;
      const result = mbtiTypes.find((t) => t.type === mbtiType);
      if (result) {
        setTestResult(result);
      }
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setTestResult(null);
  };

  const handleCardClick = () => {
    if (testResult) {
      expandCard(testResult);
      setIsOpen(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="inline-block"
      >
        <Button
          variant="default"
          className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5 rounded-full text-sm"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-lg mr-2">🎯</span>
          不知道你的 MBTI？极速自测！
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  MBTI 快速测试
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {!testResult ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {questions[currentQuestion].question}
                    </h3>
                    <div className="grid gap-3">
                      {questions[currentQuestion].options.map((option) => (
                        <motion.button
                          key={option.type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "p-4 rounded-lg border transition-all duration-300",
                            "hover:bg-gray-50 dark:hover:bg-gray-800",
                            "flex items-center gap-3",
                            "border-gray-200 dark:border-gray-700"
                          )}
                          onClick={() =>
                            handleAnswer(
                              questions[currentQuestion].dimension,
                              option.type
                            )
                          }
                        >
                          <span className="text-2xl">{option.icon}</span>
                          <span className="text-left text-gray-900 dark:text-gray-100">
                            {option.text}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="outline"
                      onClick={resetTest}
                      disabled={currentQuestion === 0}
                      className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2"
                    >
                      重新开始
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {currentQuestion + 1} / {questions.length}
                    </span>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      测试结果
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      你的 MBTI 类型是：
                    </p>
                  </div>
                  <div onClick={handleCardClick} className="cursor-pointer">
                    <MBTICard
                      type={testResult}
                      isExpanded={false}
                      onExpand={() => {}}
                      onCollapse={() => {}}
                    />
                  </div>
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={resetTest}
                      className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2"
                    >
                      再测一次
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
