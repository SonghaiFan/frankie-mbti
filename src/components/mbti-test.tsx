"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Portal from "./portal";
import { MBTIType } from "@/types/mbti";
import { mbtiTypes } from "@/data/core/mbti-data";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";
import { MBTIState } from "@/store/mbti-store";
import { TypeCard } from "@/components/type-card";

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
  const setFeatured = useMBTIStore((state: MBTIState) => state.setFeatured);

  const handleAnswer = (dimension: string, type: string) => {
    setAnswers((prev) => ({ ...prev, [dimension]: type }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const mbtiType = Object.values(answers).join("") + type;
      const result = mbtiTypes.find((t) => t.type === mbtiType);
      if (result) {
        setTestResult(result);
        // The stage is the answer — put it there rather than in a dead end.
        setFeatured(result.type);
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

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group shrink-0 border-b border-rule pb-0.5 text-[0.75rem] text-ink-soft transition-colors hover:border-ink hover:text-ink sm:pb-1 sm:text-sm"
      >
        <span className="hidden sm:inline">不知道自己的类型？</span>
        <span className="text-ink">一分钟自测</span>
      </button>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="fixed inset-0 z-[190] bg-ink/15 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                role="dialog"
                aria-modal
                aria-label="一分钟自测"
                className="fixed left-1/2 top-1/2 z-[200] max-h-[90dvh] w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-paper p-5 shadow-[0_40px_120px_-48px_rgba(0,0,0,0.35)] scroll-quiet sm:p-12"
              >
                <div className="mb-4 flex items-start justify-between gap-4 sm:mb-10 sm:gap-6">
                  <div>
                    <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">Quick Test</span>
                    <h2 className="mt-1 text-xl font-medium tracking-tight text-ink sm:mt-3 sm:text-2xl">
                      四个问题
                    </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    aria-label="关闭"
                    className="-mr-2 -mt-2 flex h-9 w-9 shrink-0 items-center justify-center text-ink-faint transition-colors hover:text-ink sm:h-10 sm:w-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {!testResult ? (
                  <div>
                    <div>
                      <h3 className="text-lg font-medium leading-relaxed tracking-tight text-ink sm:text-xl">
                        {questions[currentQuestion].question}
                      </h3>
                      <div className="mt-3 sm:mt-8">
                        {questions[currentQuestion].options.map((option) => (
                          <motion.button
                            key={option.type}
                            className={cn(
                              "rule-t w-full py-3 text-left text-[0.875rem] leading-relaxed sm:py-5 sm:text-[0.9375rem]",
                              "text-ink-soft transition-colors hover:text-ink"
                            )}
                            onClick={() =>
                              handleAnswer(
                                questions[currentQuestion].dimension,
                                option.type
                              )
                            }
                          >
                            {option.text}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="rule-t mt-2 flex items-center justify-between pt-3 sm:pt-6">
                      <button
                        type="button"
                        onClick={resetTest}
                        disabled={currentQuestion === 0}
                        className="text-[0.75rem] text-ink-faint transition-colors hover:text-ink disabled:opacity-30 disabled:hover:text-ink-faint sm:text-[0.8125rem]"
                      >
                        重新开始
                      </button>
                      <span className="eyebrow text-[0.625rem] tabular-nums sm:text-[0.6875rem]">
                        {String(currentQuestion + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div>
                      <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">Result</span>
                      <p className="mt-1.5 text-lg font-medium tracking-tight text-ink sm:mt-3 sm:text-xl">
                        你的类型
                      </p>
                    </div>
                    <div className="mx-auto max-w-[220px]">
                      <TypeCard type={testResult} onOpen={handleCardClick} />
                    </div>
                    <div className="rule-t flex items-center justify-between pt-4 sm:pt-6">
                      <button
                        type="button"
                        onClick={resetTest}
                        className="text-[0.75rem] text-ink-faint transition-colors hover:text-ink sm:text-[0.8125rem]"
                      >
                        再测一次
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="border-b border-ink pb-0.5 text-[0.875rem] font-medium text-ink transition-opacity hover:opacity-50 sm:pb-1 sm:text-[0.9375rem]"
                      >
                        在首页查看 →
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
