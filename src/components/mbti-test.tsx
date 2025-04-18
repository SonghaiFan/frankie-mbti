"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MBTIType } from "@/types/mbti";
import { mbtiTypes } from "@/data/mbti-data";
import { cn } from "@/lib/utils";
import { getMbtiColor } from "@/styles/mbti-styles";
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

  const colorStyle = testResult ? getMbtiColor(testResult.group) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          variant="default"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-full"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-lg mr-2">🎯</span>
          不知道你的 MBTI？极速自测！
        </Button>
      </motion.div>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              MBTI 快速测试
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!testResult ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {questions[currentQuestion].question}
                  </h3>
                  <div className="grid gap-4">
                    {questions[currentQuestion].options.map((option) => (
                      <motion.button
                        key={option.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "p-4 rounded-lg border transition-all duration-300",
                          "hover:bg-purple-50 dark:hover:bg-purple-900/20",
                          "flex items-center gap-3",
                          "border-purple-200 dark:border-purple-800"
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
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={resetTest}
                    disabled={currentQuestion === 0}
                    className="border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    重新开始
                  </Button>
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold mb-2">测试结果</h3>
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
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={resetTest}
                    className="border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    再测一次
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
