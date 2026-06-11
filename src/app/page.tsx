"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MBTIGrid } from "@/components/mbti-grid";
import { Footer } from "@/components/footer";
import { MBTITest } from "@/components/mbti-test";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen dot-grid relative pb-48 font-sans">
      {/* Dynamic Header */}
      <header className="border-b-4 border-[#121212] bg-white p-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 items-center">
              <div className="w-5 h-5 rounded-full bg-[#D02020] border-2 border-black" />
              <div className="w-5 h-5 bg-[#1040C0] border-2 border-black" />
              <div className="w-5 h-5 border-2 border-black bg-[#F0C020]" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
            </div>
            <span className="font-sans font-black tracking-widest text-lg text-gray-900 uppercase">MBTI × JUNG</span>
          </div>
          <div className="flex items-center gap-3">
            <MBTITest />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 pt-10 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Constructivist Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-4 border-[#121212] bg-[#F0C020] text-[#121212] p-8 md:p-12 mb-12 shadow-[6px_6px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black] relative overflow-hidden rounded-none">
            {/* Abstract geometric composition for decoration */}
            <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-12 translate-y-12 select-none">
              <div className="w-64 h-64 rounded-full bg-[#D02020] border-4 border-black absolute -left-12 -top-12" />
              <div className="w-48 h-48 bg-[#1040C0] border-4 border-black transform rotate-45" />
            </div>

            <div className="lg:col-span-8 space-y-4 relative z-10 text-left">
              <span className="inline-block bg-[#121212] text-white px-3 py-1 font-bold tracking-widest text-xs uppercase">CONSTRUCTIVIST MANUAL</span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-[#121212]">
                从MBTI到荣格八维<br />速查手册
              </h1>
              <p className="text-base sm:text-lg text-[#121212] max-w-xl font-medium leading-relaxed">
                在有限颗粒度下，这似乎是最好的谈论性格的方法。
              </p>
            </div>
            
            <div className="lg:col-span-4 flex items-center justify-center lg:justify-end relative">
              <div className="relative w-40 h-40 bg-white border-4 border-black shadow-[4px_4px_0px_0px_black] rounded-none">
                <div className="absolute top-4 left-4 w-14 h-14 rounded-full bg-[#D02020] border-2 border-black" />
                <div className="absolute bottom-4 right-4 w-14 h-14 bg-[#1040C0] border-2 border-black transform rotate-[15deg]" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 border-2 border-black bg-[#F0C020]" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="flex gap-3 items-center">
                <div className="animate-spin text-3xl font-black text-[#121212]">⚡</div>
                <span className="font-bold tracking-widest text-[#121212] uppercase font-mono">LOADING COMPILATION...</span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-20"
            >
              <MBTIGrid />
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer with relative positioning to stay above the background */}
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}

