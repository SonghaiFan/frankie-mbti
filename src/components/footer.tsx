"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import { FrankMark } from "@/components/frank-mark";

export function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const handleClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 2) {
      setShowEasterEgg(true);
      setClickCount(0);
    }
  };

  return (
    <>
      <footer onClick={handleClick} className="select-none">
        <div className="mx-auto w-full max-w-[1560px] px-6 sm:px-10 lg:px-16">
          <div className="rule-t flex flex-wrap items-baseline justify-between gap-6 py-8 sm:py-10 lg:py-4">
            <span className="flex items-center gap-2.5">
              <FrankMark className="h-6 w-auto text-ink-faint" />
              <span className="eyebrow">MBTI</span>
            </span>
            <p className="hidden max-w-[38ch] text-[0.8125rem] italic leading-relaxed text-ink-ghost lg:block">
              在有限颗粒度下，这似乎是最好的谈论性格的方法。
            </p>

            <div className="flex items-baseline gap-8">
              <a
                href="https://github.com/songhaifan2025"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[0.8125rem] text-ink-faint transition-colors hover:text-ink"
              >
                @范松海Frank
              </a>
              <span className="text-[0.8125rem] text-ink-ghost">
                © {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/15 p-6 backdrop-blur-md"
            onClick={() => setShowEasterEgg(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl bg-paper p-6 shadow-[0_40px_120px_-48px_rgba(0,0,0,0.35)] sm:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowEasterEgg(false)}
                aria-label="关闭"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center text-ink-faint transition-colors hover:text-ink"
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

              <span className="eyebrow">Match Chart</span>
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
