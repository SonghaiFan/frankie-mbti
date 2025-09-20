"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import { mbtiTypes } from "@/data/mbti-data";
import { MBTIIntroduction } from "./mbti-introduction";
import { MBTIDimensions } from "./mbti-dimensions";
import { MBTICognitiveFunctions } from "./mbti-cognitive-functions";
import {
  mbtiCard,
  mbtiCardDescription,
  getMbtiColor,
} from "@/styles/mbti-styles";
import { useEffect } from "react";
import { MBTIMatches } from "./mbti-matches";

// Add utility function at the top level
const setBodyScroll = (enabled: boolean) => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = enabled ? "auto" : "hidden";
  }
};

interface MBTICardProps {
  type: MBTIType;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

// 定义动画变体 - 使用现代 variants 语法
const cardVariants = {
  collapsed: {
    borderRadius: 12,
    scale: 1,
    transformOrigin: "center center" as const,
  },
  expanded: {
    borderRadius: 24,
    scale: 1,
    y: 0,
    zIndex: 50,
  },
};

const contentVariants = {
  collapsed: { opacity: 1 },
  expanded: {
    opacity: 1,
  },
};

const itemVariants = {
  collapsed: { opacity: 0, x: -10 },
  expanded: {
    opacity: 1,
    x: 0,
  },
};

const expandedContentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const expandedItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function MBTICard({
  type,
  isExpanded,
  onExpand,
  onCollapse,
}: MBTICardProps) {
  const mbtiInfo = mbtiTypes.find((t) => t.type === type.type);
  const colorStyle = getMbtiColor(type.group);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isExpanded) {
        onCollapse();
      }
    }

    if (isExpanded) {
      setBodyScroll(false);
      document.addEventListener("keydown", handleKeyDown);
    } else {
      setBodyScroll(true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      setBodyScroll(true);
    };
  }, [isExpanded, onCollapse]);

  if (!mbtiInfo) return null;

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onCollapse}
        />
      )}

      {/* Card/Modal */}
      <motion.div
        layout
        layoutId={`mbti-card-${type.type}`}
        variants={cardVariants}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 25,
          mass: 0.8,
          when: "beforeChildren",
        }}
        whileHover={
          !isExpanded
            ? {
                scale: 1.02,
                y: -4,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                },
              }
            : {}
        }
        className={cn(
          "relative overflow-hidden cursor-pointer",
          isExpanded
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-4xl max-h-[90vh] z-50"
            : "w-full transform-gpu hover:shadow-xl transition-shadow duration-300"
        )}
        onClick={!isExpanded ? onExpand : undefined}
        id={`mbti-card-${type.type}`}
      >
        <motion.div
          layout
          transition={{
            duration: 0.2,
          }}
          className={cn(
            mbtiCard,
            colorStyle.border,
            !isExpanded && "hover:border-opacity-80",
            "h-full"
          )}
        >
          {/* Card/Modal Content */}
          <motion.div
            layout
            transition={{
              duration: 0.1,
            }}
            className={cn(
              "h-full transition-colors duration-300",
              colorStyle.bgDark
            )}
          >
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCollapse();
                }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:bg-gray-800/10 dark:hover:bg-gray-800/20 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </motion.button>
            )}
            <motion.div
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={cn(
                "flex flex-row items-stretch",
                !isExpanded && "h-[100px]"
              )}
            >
              <motion.div
                layout
                layoutId={`mbti-image-${type.type}`} // 图片区域的共享元素ID
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 28,
                }}
                className={cn(
                  "relative overflow-hidden",
                  isExpanded ? "w-32 sm:w-40" : "w-20 sm:w-24",
                  isExpanded && "border-b border-gray-200 dark:border-gray-700"
                )}
              >
                <motion.div
                  className="absolute inset-0"
                  layout
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <Image
                    src={`/mbti_img/${mbtiInfo.image}`}
                    alt={mbtiInfo.type}
                    fill
                    sizes={
                      isExpanded
                        ? "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        : "(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw"
                    }
                    className={cn(
                      "object-cover transition-all duration-300 ease-out",
                      isExpanded ? "rounded-tl-xl" : "rounded-l-xl"
                    )}
                    priority
                  />
                </motion.div>
              </motion.div>

              <motion.div
                layout
                layoutId={`mbti-content-${type.type}`}
                variants={contentVariants}
                transition={{
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                }}
                className={cn(
                  "flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4",
                  isExpanded && "border-b border-gray-200 dark:border-gray-700 "
                )}
              >
                <motion.div layout="position" className="space-y-1 text-left">
                  <motion.h2
                    layout="position"
                    layoutId={`mbti-title-${type.type}`} // 标题的共享元素ID
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 25,
                    }}
                    className={cn(
                      "font-medium transition-all duration-300",
                      isExpanded ? "text-lg sm:text-xl" : "text-base",
                      colorStyle.text
                    )}
                  >
                    {mbtiInfo.type} · {mbtiInfo.title}
                  </motion.h2>
                  {isExpanded && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      transition={{
                        staggerChildren: 0.05,
                        delayChildren: 0.1,
                      }}
                    >
                      <motion.p
                        layout="position"
                        variants={itemVariants}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: 0.15,
                        }}
                        className={cn(mbtiCardDescription, "text-sm")}
                      >
                        👤 昵称：{mbtiInfo.nickname}
                      </motion.p>
                      <motion.p
                        layout="position"
                        variants={itemVariants}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: 0.2,
                        }}
                        className={cn(mbtiCardDescription, "text-sm")}
                      >
                        💫 特征：{mbtiInfo.traits}
                      </motion.p>
                      <motion.p
                        layout="position"
                        variants={itemVariants}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: 0.25,
                        }}
                        className={cn(mbtiCardDescription, "text-sm")}
                      >
                        📝 一句话：{mbtiInfo.slogan}
                      </motion.p>
                    </motion.div>
                  )}
                </motion.div>

                {!isExpanded && (
                  <motion.p
                    layout="position"
                    layoutId={`mbti-nickname-${type.type}`} // 昵称的共享元素ID
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    className={cn(
                      "text-xs text-left transition-all duration-200",
                      colorStyle.text
                    )}
                  >
                    {mbtiInfo.nickname}
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Expanded Content */}
          {isExpanded && (
            <motion.div
              variants={expandedContentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{
                duration: 0.4,
                delay: 0.2,
                staggerChildren: 0.1,
                when: "afterChildren",
              }}
              className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(90vh-300px)]"
            >
              <motion.div
                variants={expandedItemVariants}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.3,
                }}
              >
                <MBTIIntroduction type={type} />
              </motion.div>
              <motion.div
                variants={expandedItemVariants}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.35,
                }}
              >
                <MBTIDimensions type={type} />
              </motion.div>
              <motion.div
                variants={expandedItemVariants}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.4,
                }}
              >
                <MBTICognitiveFunctions type={type} />
              </motion.div>
              <motion.div
                variants={expandedItemVariants}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.45,
                }}
              >
                <MBTIMatches type={type} />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
