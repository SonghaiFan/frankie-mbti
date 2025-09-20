"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { mbtiTypes } from "@/data/mbti-data";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMBTIStore } from "@/store/mbti-store";
// no group color needed in compact table

interface CarouselCellProps {
  items: string[];
  className?: string;
  title?: string;
}

function CarouselCell({ items, className, title }: CarouselCellProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const delay = 1500 + Math.random() * 2000; // 1.5s ~ 3.5s per cycle
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, delay);
    return () => clearTimeout(timeout);
  }, [items.length, isPaused, currentIndex]);

  if (items.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      title={title || items.join(" · ")}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="block truncate"
        >
          {items[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

interface Column {
  key: string;
  label: string;
  width?: string;
  className?: string;
}

const columns: Column[] = [
  { key: "type", label: "类型", width: "w-20", className: "font-mono" },
  // removed title & group per request
  { key: "nickname", label: "昵称", width: "w-48" },
  { key: "cognitiveFunctions", label: "认知功能", width: "w-30 font-mono" },
  { key: "surfaceTraits", label: "表面特征", width: "w-48" },
  { key: "actualTraits", label: "实际特征", width: "w-48" },
  { key: "strengths", label: "优势", width: "w-44" },
  { key: "weaknesses", label: "弱点", width: "w-44" },
  { key: "bestPartners", label: "官方最佳配对", width: "w-40" },
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

  // Derive fixed column widths from the columns array so edits there take effect
  const colWidths = [
    "w-12", // image column
    ...columns.map((c) => (c.width ? c.width.split(" ")[0] : "w-40")),
  ];
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
          MBTI 一览表
        </h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索 类型/昵称/认知功能/表面特征/实际特征/优势/弱点..."
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/50 w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} className={w} />
            ))}
          </colgroup>
          <thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 z-10">
            <tr>
              <th
                className={cn(
                  "p-2 sticky left-0 z-20 bg-gray-50/90 dark:bg-gray-800/80 backdrop-blur",
                  colWidths[0]
                )}
              />
              {columns.map((c) => {
                const isSticky = c.key === "type"; // only 类型 is sticky besides image
                const stickyLeftClass =
                  c.key === "type"
                    ? "left-[3rem]" // w-12 = 3rem
                    : undefined;
                return (
                  <th
                    key={c.key}
                    className={cn(
                      "text-left font-medium text-gray-700 dark:text-gray-300 p-2",
                      c.width,
                      isSticky &&
                        cn(
                          "sticky z-20 bg-gray-50/90 dark:bg-gray-800/80 backdrop-blur",
                          stickyLeftClass
                        )
                    )}
                  >
                    {c.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.type}
                className="even:bg-gray-50/50 dark:even:bg-gray-800/20 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="p-2 align-middle sticky left-0 z-10 bg-white dark:bg-gray-900">
                  <Image
                    src={`/mbti_img/${t.image}`}
                    alt={t.title}
                    width={28}
                    height={28}
                    className="rounded"
                  />
                </td>
                <td
                  className={cn(
                    "p-2 align-middle font-mono font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:underline",
                    "sticky left-[3rem] z-10 bg-white dark:bg-gray-900"
                  )}
                  onClick={() => expandCard(t)}
                >
                  {t.type}
                </td>
                <td
                  className={cn(
                    "p-2 align-middle text-gray-700 dark:text-gray-300 truncate whitespace-nowrap"
                  )}
                  title={t.nickname}
                >
                  {t.nickname}
                </td>
                <td className="p-2 align-middle font-mono text-gray-800 dark:text-gray-200 truncate whitespace-nowrap">
                  {t.cognitiveFunctions}
                </td>
                <td className="p-2 align-middle text-gray-700 dark:text-gray-300">
                  <CarouselCell items={t.surfaceTraits || []} />
                </td>
                <td className="p-2 align-middle text-gray-700 dark:text-gray-300">
                  <CarouselCell items={t.actualTraits || []} />
                </td>
                <td className="p-2 align-middle text-gray-700 dark:text-gray-300">
                  <CarouselCell items={t.strengths || []} />
                </td>
                <td className="p-2 align-middle text-gray-700 dark:text-gray-300">
                  <CarouselCell items={t.weaknesses || []} />
                </td>
                <td className="p-2 align-middle text-gray-700 dark:text-gray-300">
                  {(t.bestPartners || []).length > 0 ? (
                    <span className="block truncate px-2 py-0.5 rounded">
                      {t.bestPartners?.join(" · ")}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        提示：点击类型代码可打开详细卡片；表面特征/实际特征/优势/弱点会自动轮播显示；搜索会匹配所有字段内容。
      </p>
    </div>
  );
}
