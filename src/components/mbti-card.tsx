"use client";

import { motion } from "framer-motion";
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
        initial={{ borderRadius: 12, scale: 1 }}
        animate={{
          borderRadius: isExpanded ? 24 : 12,
          scale: isExpanded ? 1 : 1,
          y: isExpanded ? 0 : 0,
        }}
        whileHover={!isExpanded ? { scale: 1.02, y: -4 } : {}}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 1,
        }}
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
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 1,
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
              type: "spring",
              stiffness: 200,
              damping: 25,
              mass: 1,
            }}
            className={cn(
              "h-full transition-colors duration-300",
              colorStyle.bgDark
            )}
          >
            <motion.div
              layout
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                mass: 1,
              }}
              className={cn(
                "flex flex-row items-stretch",
                !isExpanded && "h-[100px]"
              )}
            >
              <motion.div
                layout
                className={cn(
                  "relative",
                  isExpanded ? "w-32 sm:w-40" : "w-20 sm:w-24",
                  isExpanded && "border-b border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="absolute inset-0">
                  <Image
                    src={`/mbti_img/${mbtiInfo.image}`}
                    alt={mbtiInfo.type}
                    fill
                    className={cn(
                      "object-cover",
                      isExpanded ? "rounded-tl-xl" : "rounded-l-xl"
                    )}
                    priority
                  />
                </div>
              </motion.div>

              <motion.div
                layout
                className={cn(
                  "flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4",
                  isExpanded && "border-b border-gray-200 dark:border-gray-700 "
                )}
              >
                <motion.div layout="position" className="space-y-1 text-center">
                  <motion.h2
                    layout="position"
                    className={cn(
                      "font-medium",
                      isExpanded ? "text-lg sm:text-xl" : "text-base",
                      colorStyle.text
                    )}
                  >
                    {mbtiInfo.type} · {mbtiInfo.title}
                  </motion.h2>
                  {isExpanded && (
                    <>
                      <motion.p
                        layout="position"
                        className={cn(mbtiCardDescription, "text-sm")}
                      >
                        👤 昵称：{mbtiInfo.nickname}
                      </motion.p>
                      <motion.p
                        layout="position"
                        className={cn(mbtiCardDescription, "text-sm")}
                      >
                        💫 特征：{mbtiInfo.traits}
                      </motion.p>
                      <motion.p
                        layout="position"
                        className={cn(mbtiCardDescription, "text-sm")}
                      >
                        📝 一句话：{mbtiInfo.slogan}
                      </motion.p>
                    </>
                  )}
                </motion.div>

                {!isExpanded && (
                  <motion.p
                    layout="position"
                    className={cn("text-xs text-center", colorStyle.text)}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 1,
              }}
              className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(90vh-300px)]"
            >
              <MBTIIntroduction type={type} />
              <MBTIDimensions type={type} />
              <MBTICognitiveFunctions type={type} />
              <MBTIMatches type={type} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
