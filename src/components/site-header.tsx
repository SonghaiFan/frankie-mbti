"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MBTITest } from "@/components/mbti-test";
import { FrankMark } from "@/components/frank-mark";

const SHELL = "mx-auto w-full max-w-[1560px] px-6 sm:px-10 lg:px-16";

const views = [
  { href: "/", name: "类型", nameEn: "Types" },
  { href: "/functions", name: "主导功能", nameEn: "Functions" },
  { href: "/matrix", name: "配对矩阵", nameEn: "Matrix" },
  { href: "/compact", name: "一览表", nameEn: "Index" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-paper/85 backdrop-blur-xl transition-[border-color] duration-500",
        scrolled ? "border-rule" : "border-transparent"
      )}
    >
      <div className={cn(SHELL, "flex h-16 items-center justify-between gap-8 sm:h-20")}>
        <Link
          href="/"
          aria-label="Frank MBTI · 首页"
          className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-60"
        >
          <FrankMark className="h-7 w-auto text-ink sm:h-8" />
          <span className="eyebrow !text-ink">MBTI</span>
        </Link>

        {/* Desktop: the views live here, not stacked down the page */}
        <nav className="hidden flex-1 items-center gap-10 md:flex">
          {views.map((view) => {
            const isActive = pathname === view.href;
            return (
              <Link
                key={view.href}
                href={view.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative py-1 text-[0.9375rem] transition-colors duration-300",
                  isActive ? "text-ink" : "text-ink-ghost hover:text-ink-soft"
                )}
              >
                {view.name}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-1 block h-px bg-ink" />
                )}
              </Link>
            );
          })}
        </nav>

        <MBTITest />
      </div>

      {/* Mobile: same views, one scrollable strip */}
      <div className={cn(SHELL, "md:hidden")}>
        <nav className="scroll-quiet -mx-1 flex gap-7 overflow-x-auto px-1 pb-3">
          {views.map((view) => {
            const isActive = pathname === view.href;
            return (
              <Link
                key={view.href}
                href={view.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative shrink-0 whitespace-nowrap py-1 text-[0.9375rem] transition-colors",
                  isActive ? "text-ink" : "text-ink-ghost"
                )}
              >
                {view.name}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-0.5 block h-px bg-ink" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
