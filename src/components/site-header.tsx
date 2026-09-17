"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MBTITest } from "@/components/mbti-test";
import { FrankMark } from "@/components/frank-mark";
import { useMBTIStore } from "@/store/mbti-store";
import { motion } from "motion/react";

const SHELL = "mx-auto w-full max-w-[1560px] px-4 sm:px-10 lg:px-16";

const views = [
  { href: "/", name: "类型", nameEn: "Types" },
  { href: "/groups", name: "四大组别", nameEn: "Groups" },
  { href: "/functions", name: "主导功能", nameEn: "Functions" },
  { href: "/pairing", name: "配对", nameEn: "Pairing" },
  { href: "/compact", name: "一览表", nameEn: "Index" },
  { href: "/claims", name: "观点", nameEn: "Claims" },
  { href: "/consult", name: "AI咨询", nameEn: "Consult" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const fetchStatus = useMBTIStore((s) => s.fetchStatus);
  const dbStats = useMBTIStore((s) => s.dbStats);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-paper/85 backdrop-blur-xl transition-[border-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled ? "border-rule" : "border-transparent"
      )}
    >
      <div className={cn(SHELL, "flex h-13 items-center justify-between gap-4 sm:h-16 sm:gap-8")}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Frank MBTI · 首页"
            className="group flex shrink-0 items-center gap-2 sm:gap-2.5 transition-opacity duration-150 hover:opacity-60"
          >
            <FrankMark className="h-6 w-auto text-ink sm:h-7" />
            <span className="eyebrow !text-ink text-[0.625rem] sm:text-[0.6875rem]">MBTI</span>
          </Link>
          {dbStats?.connected && (
            <span
              title={`知识图谱已就绪 (${dbStats?.nodes ?? 0} 实体, ${dbStats?.relationships ?? 0} 关联)`}
              className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[0.625rem] text-emerald-700 bg-emerald-500/10 rounded-full border border-emerald-500/20 font-mono"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Graph {dbStats?.nodes ?? ""}
            </span>
          )}
        </div>

        {/* Desktop: the views live here, not stacked down the page */}
        <nav className="hidden flex-1 items-center justify-center gap-3.5 md:flex lg:gap-7 xl:gap-10">
          {views.map((view) => {
            const isActive = pathname === view.href;
            return (
              <Link
                key={view.href}
                href={view.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative py-1 text-[0.875rem] lg:text-[0.9375rem] transition-colors duration-150 whitespace-nowrap",
                  isActive ? "text-ink" : "text-ink-ghost hover:text-ink-soft"
                )}
              >
                {view.name}
                {isActive && (
                  <motion.span
                    layoutId="header-active-nav-desktop"
                    className="absolute inset-x-0 -bottom-1 block h-px bg-ink"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <MBTITest />
      </div>

      {/* Mobile: same views, one scrollable strip */}
      <div className={cn(SHELL, "md:hidden")}>
        <nav className="scroll-quiet -mx-1 flex gap-5 overflow-x-auto px-1 pb-1 pt-0 sm:gap-7 sm:pb-2">
          {views.map((view) => {
            const isActive = pathname === view.href;
            return (
              <Link
                key={view.href}
                href={view.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative shrink-0 whitespace-nowrap py-1.5 text-[0.8125rem] transition-colors duration-150 sm:py-2 sm:text-[0.9375rem] touch-manipulation",
                  isActive ? "text-ink font-medium" : "text-ink-ghost"
                )}
              >
                {view.name}
                {isActive && (
                  <motion.span
                    layoutId="header-active-nav-mobile"
                    className="absolute inset-x-0 bottom-0 block h-px bg-ink"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
