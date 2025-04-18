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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/90 py-8 pb-16">
      <div className="container mx-auto px-4 max-w-8xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            了解MBTI vs 认知功能
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            探索你的mbti人设和荣格八维功能
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <MBTITest />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
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
