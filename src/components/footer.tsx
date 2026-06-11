"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";

export function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 2) {
      setShowEasterEgg(true);
      setClickCount(0);
    }
  };

  return (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 w-full py-4 bg-white border-t-4 border-[#121212] shadow-[0_-4px_0px_0px_rgba(18,18,18,1)] z-40"
        onClick={handleClick}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#D02020] border border-black" />
              <p className="text-xs sm:text-sm font-bold tracking-wider text-[#121212] uppercase">
                MBTI × JUNG SPECIFICATION
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-xs text-gray-700">
              <p>
                Created by{" "}
                <a
                  href="https://github.com/songhaifan2025"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:text-[#D02020] border-b-2 border-transparent hover:border-[#D02020] transition-all"
                >
                  @范松海Frank
                </a>
              </p>
              <p className="font-mono opacity-60">
                © {new Date().getFullYear()} Bauhaus Modernism.
              </p>
            </div>
          </div>
        </div>
      </motion.footer>

      {showEasterEgg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowEasterEgg(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white p-4 max-w-4xl w-full mx-4 border-4 border-black shadow-[8px_8px_0px_0px_black] rounded-none relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEasterEgg(false)}
              className="absolute top-3 right-3 text-black font-black text-lg hover:text-[#D02020] border-2 border-black w-8 h-8 flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              ✕
            </button>
            <div className="relative w-full aspect-[16/9] border-2 border-black">
              <Image
                src="/match.png"
                alt="MBTI Matches"
                fill
                className="object-contain bg-white"
                priority
              />
            </div>
            <p className="text-center mt-4 text-sm font-bold tracking-widest text-[#121212] uppercase">
              🎉 EGG DETECTED: MBTI MATCH CHART
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

