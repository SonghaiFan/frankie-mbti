"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { mbtiTypes } from "@/data/mbti-data";
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
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="block truncate"
        >
          {items[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

const columns = [
  { key: "type", label: "类型", width: "w-24" },
  { key: "nickname", label: "昵称", width: "w-52" },
  { key: "cognitiveFunctions", label: "认知功能", width: "w-40" },
  { key: "surfaceTraits", label: "表面特征", width: "w-48" },
  { key: "actualTraits", label: "实际特征", width: "w-48" },
  { key: "strengths", label: "优势", width: "w-44" },
  { key: "weaknesses", label: "弱点", width: "w-44" },
  { key: "bestPartners", label: "官方最佳配对", width: "w-44" },
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

  const colWidths = ["w-16", ...columns.map((c) => c.width)];

  return (
    <section className="flex flex-col lg:h-full lg:min-h-0">
      <header className="mb-8 flex shrink-0 flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
        <div>
          <span className="eyebrow">Index</span>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-ink sm:text-[1.75rem]">
            十六型一览
          </h2>
        </div>

        <div className="w-full sm:w-80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索类型 / 功能 / 特征"
            aria-label="搜索"
            className="w-full border-0 border-b border-rule bg-transparent pb-3 text-[0.9375rem] text-ink placeholder:text-ink-ghost focus:border-ink focus:outline-none focus:ring-0 transition-colors"
          />
        </div>
      </header>

      <div className="scroll-quiet overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <table className="w-full table-fixed text-left text-[0.8125rem]">
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} className={w} />
            ))}
          </colgroup>

          <thead className="sticky top-0 z-10 bg-paper">
            <tr className="rule-b">
              <th className="pb-4" />
              {columns.map((c) => (
                <th key={c.key} className="pb-4 pr-6 text-left font-normal">
                  <span className="eyebrow">{c.label}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => (
              <tr key={t.type} className="rule-t group transition-colors">
                <td className="py-4">
                  <span
                    className="relative block h-11 w-11 overflow-hidden"
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

                <td className="py-4 pr-6 align-middle">
                  <button
                    type="button"
                    onClick={() => expandCard(t)}
                    className="text-lg font-medium tracking-tight text-ink transition-opacity hover:opacity-50"
                  >
                    {t.type}
                  </button>
                </td>

                <td
                  className="truncate py-4 pr-6 align-middle text-ink-soft"
                  title={t.nickname}
                >
                  {t.nickname}
                </td>
                <td className="truncate py-4 pr-6 align-middle tracking-tight text-ink-soft">
                  {t.cognitiveFunctions}
                </td>
                <td className="py-4 pr-6 align-middle text-ink-soft">
                  <CarouselCell items={t.surfaceTraits || []} />
                </td>
                <td className="py-4 pr-6 align-middle text-ink-soft">
                  <CarouselCell items={t.actualTraits || []} />
                </td>
                <td className="py-4 pr-6 align-middle text-ink-soft">
                  <CarouselCell items={t.strengths || []} />
                </td>
                <td className="py-4 pr-6 align-middle text-ink-soft">
                  <CarouselCell items={t.weaknesses || []} />
                </td>
                <td className="truncate py-4 align-middle text-ink-soft">
                  {(t.bestPartners || []).length > 0
                    ? t.bestPartners.join(" · ")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="rule-t mt-2 shrink-0 pt-5 text-[0.8125rem] leading-relaxed text-ink-ghost">
        点击类型代码展开详情。特征列自动轮播，鼠标悬停可暂停。
      </p>
    </section>
  );
}
