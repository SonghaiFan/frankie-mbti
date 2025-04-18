"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  if (!mbtiInfo) return null;

  const colorStyle = getMbtiColor(type.group);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isExpanded) {
        onCollapse();
      }
    }

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isExpanded, onCollapse]);

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
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl max-h-[90vh] z-50"
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
            !isExpanded && "hover:border-opacity-80"
          )}
        >
          {/* Card/Modal Content */}
          <motion.div
            layout
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 1,
            }}
            className={cn("p-4 transition-colors duration-300", colorStyle.bg)}
          >
            <motion.div
              layout
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 1,
              }}
              className="flex flex-col md:flex-row items-start gap-6"
            >
              <motion.div
                layout
                className={cn(
                  "relative mx-auto md:mx-0",
                  isExpanded ? "w-40 h-40" : "w-24 h-24"
                )}
              >
                <Image
                  src={`/mbti_img/${mbtiInfo.image}`}
                  alt={mbtiInfo.type}
                  width={isExpanded ? 160 : 96}
                  height={isExpanded ? 160 : 96}
                  className="object-contain rounded-xl"
                  priority
                />
              </motion.div>

              <motion.div layout className="flex-1 space-y-4">
                <motion.div layout="position" className="space-y-1">
                  <motion.h2
                    layout="position"
                    className={cn(
                      "font-medium",
                      isExpanded ? "text-2xl" : "text-lg text-center",
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
                        📝 一句话：{mbtiInfo.motto}
                      </motion.p>
                    </>
                  )}
                </motion.div>

                {!isExpanded && (
                  <motion.p
                    layout="position"
                    className={cn("text-center text-xs", colorStyle.text)}
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
              className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-300px)]"
            >
              <MBTIIntroduction type={type} />
              <MBTIDimensions type={type} />
              <MBTICognitiveFunctions type={type} />
            </motion.div>
          )}

          {/* Close Button */}
          {isExpanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 1,
              }}
              onClick={onCollapse}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
