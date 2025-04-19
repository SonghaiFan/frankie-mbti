"use client";

import { motion } from "framer-motion";
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 w-full py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800"
        onClick={handleClick}
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col items-center justify-center space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Created with by{" "}
              <a
                href="https://github.com/songhaifan2025"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                @范松海2025
              </a>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>

      {showEasterEgg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowEasterEgg(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-4xl w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEasterEgg(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
            <div className="relative w-full aspect-[16/9]">
              <Image
                src="/match.png"
                alt="MBTI Matches"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              🎉 你发现了隐藏的MBTI配对图！
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
