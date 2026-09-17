"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { mbtiTypes } from "@/data/core/mbti-data";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";
import { accentWash } from "@/styles/mbti-styles";

interface CarouselCellProps {
  items: string[];
  className?: string;
}

/** Cycles through a list in place, so a wide table stays one screen tall. */
function CarouselCell({ items, className }: CarouselCellProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const delay = 1800 + Math.random() * 2200;
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, delay);
    return () => clearTimeout(timeout);
  }, [items.length, isPaused, currentIndex]);

  if (items.length === 0) return <span className="text-ink-ghost">—</span>;

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      title={items.join(" · ")}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 4, opacity: 0, filter: "blur(2px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -4, opacity: 0, filter: "blur(2px)" }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="block truncate"
        >
          {items[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

const columns = [
  { key: "type", label: "类型", width: "w-20 sm:w-24" },
  { key: "nickname", label: "昵称", width: "w-44 sm:w-52" },
  { key: "cognitiveFunctions", label: "认知功能", width: "w-36 sm:w-40" },
  { key: "surfaceTraits", label: "表面特征", width: "w-44 sm:w-48" },
  { key: "actualTraits", label: "实际特征", width: "w-44 sm:w-48" },
  { key: "strengths", label: "优势", width: "w-40 sm:w-44" },
  { key: "weaknesses", label: "弱点", width: "w-40 sm:w-44" },
  { key: "bestPartners", label: "官方最佳配对", width: "w-40 sm:w-44" },
];

export function MBTICompactTable() {
  const [query, setQuery] = useState("");
  const expandCard = useMBTIStore((s) => s.expandCard);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mbtiTypes;
    return mbtiTypes.filter((t) =>
      [
        t.type,
        t.title,
        t.group,
        t.nickname,
        t.cognitiveFunctions,
        ...(t.surfaceTraits || []),
        ...(t.actualTraits || []),
        ...(t.strengths || []),
        ...(t.weaknesses || []),
        ...(t.bestPartners || []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  const colWidths = ["w-12 sm:w-16", ...columns.map((c) => c.width)];

  return (
    <section className="flex flex-col lg:h-full lg:min-h-0">
      <header className="mb-3 flex shrink-0 flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
        <div>
          <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">Index</span>
          <h2 className="mt-1 text-xl font-medium tracking-tight text-ink sm:mt-3 sm:text-[1.75rem]">
            十六型一览
          </h2>
        </div>

        <div className="w-full sm:w-80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索类型 / 功能 / 特征"
            aria-label="搜索"
            className="w-full border-0 border-b border-rule bg-transparent pb-1.5 text-[0.875rem] text-ink placeholder:text-ink-ghost focus:border-ink focus:outline-none focus:ring-0 transition-colors duration-150 sm:pb-3 sm:text-[0.9375rem]"
          />
        </div>
      </header>

      <div className="scroll-quiet overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <table className="w-full table-fixed text-left text-[0.8125rem] border-separate border-spacing-0">
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} className={w} />
            ))}
          </colgroup>

          <thead className="sticky top-0 z-20 bg-paper">
            <tr className="rule-b">
              <th className="sticky top-0 left-0 z-30 bg-paper pb-2 sm:pb-4 border-b border-rule" />
              {columns.map((c) => {
                const isType = c.key === "type";
                const isNickname = c.key === "nickname";
                return (
                  <th
                    key={c.key}
                    className={cn(
                      "pb-2 pr-4 text-left font-normal sm:pb-4 sm:pr-6 border-b border-rule bg-paper",
                      isType && "sticky top-0 left-12 sm:left-16 z-30 border-r border-rule-strong shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]",
                      !isType && "sticky top-0 z-20",
                      isNickname && "pl-4 sm:pl-6"
                    )}
                  >
                    <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{c.label}</span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => (
              <tr key={t.type} className="rule-t group transition-colors duration-150 hover:bg-[#fafaf8]">
                <td className="sticky left-0 z-10 bg-paper py-2 sm:py-4 transition-colors group-hover:bg-[#fafaf8] border-b border-rule">
                  <span
                    className="relative block h-7 w-7 overflow-hidden sm:h-11 sm:w-11"
                    style={{ backgroundColor: accentWash(t.group) }}
                  >
                    <Image
                      src={`/mbti_img/${t.image}`}
                      alt={t.type}
                      fill
                      sizes="44px"
                      className="object-contain object-bottom"
                    />
                  </span>
                </td>

                <td className="sticky left-12 sm:left-16 z-10 bg-paper py-2 pr-4 align-middle sm:py-4 sm:pr-6 border-r border-rule-strong shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] transition-colors group-hover:bg-[#fafaf8] border-b border-rule">
                  <button
                    type="button"
                    onClick={() => expandCard(t)}
                    className="text-base font-medium tracking-tight text-ink transition-opacity duration-150 hover:opacity-50 sm:text-lg"
                  >
                    {t.type}
                  </button>
                </td>

                <td
                  className="truncate py-2 pl-4 pr-4 align-middle text-ink-soft sm:py-4 sm:pl-6 sm:pr-6 border-b border-rule"
                  title={t.nickname}
                >
                  {t.nickname}
                </td>
                <td className="truncate py-2 pr-4 align-middle tracking-tight text-ink-soft sm:py-4 sm:pr-6 border-b border-rule">
                  {t.cognitiveFunctions}
                </td>
                <td className="py-2 pr-4 align-middle text-ink-soft sm:py-4 sm:pr-6 border-b border-rule">
                  <CarouselCell items={t.surfaceTraits || []} />
                </td>
                <td className="py-2 pr-4 align-middle text-ink-soft sm:py-4 sm:pr-6 border-b border-rule">
                  <CarouselCell items={t.actualTraits || []} />
                </td>
                <td className="py-2 pr-4 align-middle text-ink-soft sm:py-4 sm:pr-6 border-b border-rule">
                  <CarouselCell items={t.strengths || []} />
                </td>
                <td className="py-2 pr-4 align-middle text-ink-soft sm:py-4 sm:pr-6 border-b border-rule">
                  <CarouselCell items={t.weaknesses || []} />
                </td>
                <td className="truncate py-2 align-middle text-ink-soft sm:py-4 border-b border-rule">
                  {(t.bestPartners || []).length > 0
                    ? t.bestPartners.join(" · ")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="rule-t mt-2 shrink-0 pt-2 text-[0.75rem] leading-relaxed text-ink-ghost sm:pt-5 sm:text-[0.8125rem]">
        点击类型代码展开详情。前两列与表头已锁定固定，可向右或向下滚动浏览完整数据。特征列自动轮播，鼠标悬停可暂停。
      </p>
    </section>
  );
}
