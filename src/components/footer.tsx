"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 w-full py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800"
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
  );
}
