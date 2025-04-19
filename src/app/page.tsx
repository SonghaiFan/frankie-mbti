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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/90 relative">
      {/* Header Mountains Background */}
      <div
        className="absolute top-0 left-0 right-0 h-[400px] bg-no-repeat bg-cover bg-bottom z-0 opacity-60 dark:opacity-40"
        style={{
          backgroundImage:
            "url(https://www.16personalities.com/static/images/homepage/header-mountains-desktop.svg)",
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-80">
        <div className="container mx-auto px-4 max-w-8xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3 mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              🔮从MBTI到荣格八维
            </h1>
            <p className="text-base text-gray-800 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              在有限颗粒度下，这似乎是最好的谈论性格的方法
            </p>
            <div className="flex items-center justify-center gap-2">
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
              className="mb-20"
            >
              <MBTIGrid />
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer Background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[400px] bg-no-repeat bg-cover bg-top z-0 opacity-60 dark:opacity-40"
        style={{
          backgroundImage:
            "url(https://www.16personalities.com/static/images/homepage/footer-desktop.svg)",
        }}
      />

      {/* Footer with relative positioning to stay above the background */}
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
