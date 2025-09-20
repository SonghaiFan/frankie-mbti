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
          "relative",
          // 展开与收起均允许溢出，营造 out-of-box 效果
          "overflow-visible",
          isExpanded
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-4xl max-h-[90vh] z-[200] cursor-default"
            : "w-full transform-gpu hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        )}
        onClick={!isExpanded ? onExpand : undefined}
        id={`mbti-card-${type.type}`}
        role={isExpanded ? "dialog" : undefined}
        aria-modal={isExpanded ? true : undefined}
      >
        {/* Image overlay for out-of-box effect (sibling to card to avoid clipping) */}
        <motion.div
          layout
          layoutId={`mbti-image-${type.type}`}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className={cn(
            "absolute left-0 top-0 pointer-events-none",
            // Ensure overlay sits above card chrome
            "z-30",
            // Size matches the reserved placeholder width
            isExpanded ? "w-32 sm:w-40" : "w-20 sm:w-24",
            // Allow image to exceed top
            "overflow-visible"
          )}
        >
          <div
            className={cn(
              "relative inset-0",
              isExpanded ? "h-[120px] sm:h-[140px]" : "h-[100px] sm:h-[120px]"
            )}
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
                "object-contain object-left-bottom transition-transform duration-300 ease-out will-change-transform",
                isExpanded
                  ? // Expanded: remove rounding so head can go beyond modal curve
                    "-translate-y-2 sm:-translate-y-3 scale-[1.4] origin-bottom-left drop-shadow-lg "
                  : // Small/collapsed: move a bit more upward
                    "rounded-l-xl -translate-y-5 sm:-translate-y-6 scale-[1.2] origin-bottom-left drop-shadow-lg"
              )}
              priority
            />
          </div>
        </motion.div>

        <motion.div
          layout
          transition={{
            duration: 0.2,
          }}
          className={cn(
            mbtiCard,
            colorStyle.border,
            !isExpanded && "hover:border-opacity-80",
            // 恢复裁剪以保持圆角完整，图片已移动到上方 sibling 覆盖层
            "overflow-hidden z-0",
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
                type="button"
                aria-label="关闭"
                className="absolute top-3 right-3 z-[100] p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:bg-gray-800/10 dark:hover:bg-gray-800/20 transition-colors pointer-events-auto"
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
                "flex flex-row",
                // 两种状态均保持垂直居中，收起固定高度，展开最小高度
                !isExpanded
                  ? "items-center h-[100px]"
                  : "items-center min-h-[120px] sm:min-h-[140px]"
              )}
            >
              {/* Placeholder column to reserve space for the image overlay */}
              <div
                className={cn(
                  "shrink-0",
                  isExpanded
                    ? "w-32 sm:w-40 mr-0 h-[120px] sm:h-[140px]"
                    : "w-20 sm:w-24 mr-3 sm:mr-4 h-[100px]"
                )}
              />

              <motion.div
                layout
                layoutId={`mbti-content-${type.type}`}
                variants={contentVariants}
                transition={{
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                }}
                className={cn(
                  "relative z-40 flex-1 space-y-3 sm:space-y-4",
                  // 收起时减少内边距，顶部对齐
                  !isExpanded && "p-0 sm:py-0 sm:pr-2",
                  // 展开时恢复更舒适的留白
                  isExpanded && "p-4 sm:p-6",
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
                      "font-medium transition-all duration-300 leading-tight",
                      isExpanded ? "text-xl sm:text-3xl" : "text-sm",
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
