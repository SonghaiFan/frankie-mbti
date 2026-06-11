"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import { mbtiTypes } from "@/data/mbti-data";
import { MBTIIntroduction } from "./mbti-introduction";
import { MBTIDimensions } from "./mbti-dimensions";
import { MBTICognitiveFunctions } from "./mbti-cognitive-functions";
import {
  mbtiCard,
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

// 定义动画变体 - 使用现代 variants 语法 (包豪斯无圆角)
const cardVariants = {
  collapsed: {
    borderRadius: 0,
    scale: 1,
    transformOrigin: "center center" as const,
    zIndex: 1,
  },
  expanded: {
    borderRadius: 0,
    scale: 1,
    y: 0,
    zIndex: 200,
  },
};

const avatarVariants = {
  collapsed: {
    scale: 1.25,
    y: -16,
    x: 0,
    originX: 0.5,
    originY: 1,
  },
  expanded: {
    scale: 1.15,
    y: -4,
    x: 0,
    originX: 0.5,
    originY: 1,
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
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onCollapse}
          />
        )}
      </AnimatePresence>

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
                zIndex: 30,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                },
              }
            : {}
        }
        className={cn(
          "relative rounded-none",
          // 展开与收起均允许溢出，营造 out-of-box 效果
          "overflow-visible",
          isExpanded
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-4xl max-h-[90vh] z-[200] cursor-default"
            : "w-full transform-gpu hover:shadow-[8px_8px_0px_0px_rgba(18,18,18,1)] transition-shadow duration-300 cursor-pointer"
        )}
        onClick={!isExpanded ? onExpand : undefined}
        id={`mbti-card-${type.type}`}
        role={isExpanded ? "dialog" : undefined}
        aria-modal={isExpanded ? true : undefined}
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
            "overflow-visible z-0 h-full rounded-none",
            isExpanded && "border-4 sm:border-8 shadow-[12px_12px_0px_0px_rgba(18,18,18,1)]"
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
              isExpanded
                ? colorStyle.bgDark.split(' ').filter(c => c.startsWith('bg-') || c === 'text-white').join(' ')
                : colorStyle.bg.split(' ')[0]
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
                className="absolute top-4 right-4 z-[100] w-10 h-10 border-4 border-black bg-[#D02020] text-white flex items-center justify-center hover:bg-black transition-colors rounded-none shadow-[2px_2px_0px_0px_black] cursor-pointer pointer-events-auto"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </motion.button>
            )}
            {!isExpanded && (
              <div className="absolute top-2 right-2 flex gap-1 z-20 pointer-events-none">
                {type.group === "分析师" && <div className="w-3.5 h-3.5 bg-mbti-nt border-2 border-black rounded-none rotate-45" title="NT Analyst" />}
                {type.group === "外交官" && <div className="w-3.5 h-3.5 bg-mbti-nf border-2 border-black rounded-full" title="NF Diplomat" />}
                {type.group === "守护者" && <div className="w-3.5 h-3.5 bg-mbti-sj border-2 border-black rounded-none" title="SJ Sentinel" />}
                {type.group === "探险家" && <div className="w-4 h-4 bg-mbti-sp border-2 border-black [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" title="SP Explorer" />}
              </div>
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
                // 两种状态均保持垂直居中，收起固定高度，展开最小高度
                !isExpanded
                  ? "h-[100px]"
                  : "min-h-[120px] sm:min-h-[140px]"
              )}
            >
              {/* Left Column (Avatar Container) */}
              <div
                className={cn(
                  "relative shrink-0 flex-none overflow-visible",
                  isExpanded ? "w-32 sm:w-40 mr-0" : "w-20 sm:w-24 mr-3 sm:mr-4"
                )}
              >
                <motion.div
                  layout
                  layoutId={`mbti-image-${type.type}`}
                  variants={avatarVariants}
                  initial="collapsed"
                  animate={isExpanded ? "expanded" : "collapsed"}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="absolute left-0 bottom-0 w-full pointer-events-none z-[110] overflow-visible"
                  style={{
                    height: isExpanded ? "150px" : "90px"
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={`/mbti_img/${mbtiInfo.image}`}
                      alt={mbtiInfo.type}
                      fill
                      sizes={
                        isExpanded
                          ? "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          : "(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw"
                      }
                      className="object-contain object-bottom drop-shadow-lg"
                      priority
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div
                layout
                layoutId={`mbti-content-${type.type}`}
                variants={contentVariants}
                transition={{
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                }}
                className={cn(
                  "relative z-40 flex-1 space-y-3 sm:space-y-4 text-left",
                  // 收起时减少内边距，顶部对齐
                  !isExpanded && "p-0 sm:py-0 sm:pr-2 flex flex-col justify-center",
                  // 展开时恢复更舒适的留白
                  isExpanded && "p-4 sm:p-6",
                  isExpanded && "border-b-4 border-black bg-white"
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
                      "font-black uppercase tracking-tighter transition-all duration-300 leading-none",
                      isExpanded ? "text-2xl sm:text-5xl mb-2" : "text-sm",
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
                      className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 border-t-2 border-black pt-4 text-black"
                    >
                      <motion.div
                        layout="position"
                        variants={itemVariants}
                        className="bg-white border-2 border-black p-2 rounded-none shadow-[2px_2px_0px_0px_black] text-xs font-bold"
                      >
                        <span className="font-black block uppercase text-gray-500 mb-0.5">昵称 / NICKNAME</span>
                        {mbtiInfo.nickname}
                      </motion.div>
                      <motion.div
                        layout="position"
                        variants={itemVariants}
                        className="bg-white border-2 border-black p-2 rounded-none shadow-[2px_2px_0px_0px_black] text-xs font-bold"
                      >
                        <span className="font-black block uppercase text-gray-500 mb-0.5">特征 / TRAITS</span>
                        {mbtiInfo.traits}
                      </motion.div>
                      <motion.div
                        layout="position"
                        variants={itemVariants}
                        className="bg-white border-2 border-black p-2 rounded-none shadow-[2px_2px_0px_0px_black] text-xs font-bold"
                      >
                        <span className="font-black block uppercase text-gray-500 mb-0.5">宣告 / SLOGAN</span>
                        {mbtiInfo.slogan}
                      </motion.div>
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
                      "text-xs text-left transition-all duration-200 font-bold",
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
          <AnimatePresence>
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
                className="p-4 sm:p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-280px)] bg-[#F0F0F0] dot-grid"
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
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
