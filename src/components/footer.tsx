"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const easeSmoothOut = [0.22, 1, 0.36, 1] as const;

const backdropVariants = {
  closed: { opacity: 0, transition: { duration: 0.15, ease: "linear" as const } },
  open: { opacity: 1, transition: { duration: 0.25, ease: "linear" as const } },
};

const modalVariants = {
  closed: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.15, ease: easeSmoothOut },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: easeSmoothOut },
  },
};

export function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const next = clickCount + 1;
    if (next >= 2) {
      setShowEasterEgg(true);
      setClickCount(0);
    } else {
      setClickCount(next);
      timerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 700);
    }
  };

  useEffect(() => {
    if (!showEasterEgg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEasterEgg(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showEasterEgg]);

  return (
    <>
      <footer
        onClick={handleClick}
        onDoubleClick={() => setShowEasterEgg(true)}
        className="select-none text-[0.6875rem] text-ink-faint cursor-default"
      >
        <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-8 lg:px-16">
          <div className="rule-t flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2 sm:py-2.5 lg:py-2">
            {/* Left: Foundation & Model (No header logo repeat) */}
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
              <span className="tracking-wide">
                荣格八维认知模型 · 知识图谱驱动
              </span>
              <span className="hidden xl:inline text-ink-ghost">·</span>
              <span className="hidden xl:inline font-mono text-[0.625rem] text-ink-ghost">
                16 TYPES / 知识图谱
              </span>
            </div>

            {/* Center: Quote */}
            <p className="hidden md:block italic text-ink-faint text-[0.75rem]">
              在有限颗粒度下，这似乎是最好的谈论性格的方法。
            </p>

            {/* Right: Author & Copyright (Easter egg hidden, triggered via double-clicking footer) */}
            <div className="flex items-center gap-3 sm:gap-5 text-ink-soft">
              <a
                href="https://songhaifan.github.io/frankie-mbti/" aria-label="About Frankie MBTI"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="transition-colors duration-150 hover:text-ink text-[0.6875rem]"
              >
<span aria-hidden="true" style={{ display: "block", width: 76, height: 26, backgroundColor: "currentColor", mask: "url(/frankie-signature.svg) center / contain no-repeat", WebkitMask: "url(/frankie-signature.svg) center / contain no-repeat" }} />
              </a>
              <span className="text-ink-ghost font-mono text-[0.625rem]">
                © {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/15 p-6 backdrop-blur-md"
            onClick={() => setShowEasterEgg(false)}
          >
            <motion.div
              variants={modalVariants}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate="open"
              exit="closed"
              className="relative w-full max-w-5xl bg-paper p-6 shadow-[0_40px_120px_-48px_rgba(0,0,0,0.35)] sm:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowEasterEgg(false)}
                aria-label="关闭"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center text-ink-faint transition-colors duration-150 hover:text-ink"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <span className="eyebrow">🎉 隐藏彩蛋 · Match Chart</span>
                <span className="hidden sm:inline font-mono text-[0.6875rem] text-ink-ghost">
                  · 16 型人格关系与配对总表
                </span>
              </div>
              <div className="relative mt-6 aspect-[16/9] w-full">
                <Image
                  src="/match.png"
                  alt="MBTI 配对总表"
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
