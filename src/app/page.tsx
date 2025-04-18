"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MBTIGrid } from "@/components/mbti-grid";
import { Footer } from "@/components/footer";
import { MBTITest } from "@/components/mbti-test";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 py-12 pb-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            了解MBTI vs 认知功能
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            探索你的mbti人设和荣格八维功能
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MBTITest />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-bounce text-4xl">🎲</div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MBTIGrid />
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  );
}
