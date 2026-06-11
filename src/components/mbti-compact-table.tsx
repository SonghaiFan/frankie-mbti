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
  {
    key: "cognitiveFunctions",
    label: "认知功能",
    width: "w-[7.5rem] font-mono",
  },
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black uppercase tracking-tighter text-[#121212]">
          MBTI 一览表 / COMPACT VIEW
        </h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索 类型/功能/特征/优势/弱点..."
          className="px-3 py-2 text-sm rounded-none border-4 border-black bg-white text-black font-bold focus:outline-none shadow-[3px_3px_0px_0px_black] w-full sm:w-80"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-none border-4 border-black bg-white shadow-[8px_8px_0px_0px_black]">
        <table className="w-full text-xs table-fixed">
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} className={w} />
            ))}
          </colgroup>
          <thead className="sticky top-0 bg-[#E0E0E0] border-b-4 border-black z-10 text-black">
            <tr>
              <th
                className={cn(
                  "p-2 sticky left-0 z-20 bg-[#E0E0E0] border-r-4 border-black",
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
                      "text-left font-black uppercase tracking-tighter p-2 border-b-4 border-black",
                      c.width,
                      isSticky &&
                        cn(
                          "sticky z-20 bg-[#E0E0E0] border-r-4 border-black",
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
                className="border-b-2 border-black hover:bg-gray-50 transition-colors"
              >
                <td className="p-2 align-middle sticky left-0 z-10 bg-white border-r-4 border-black">
                  <Image
                    src={`/mbti_img/${t.image}`}
                    alt={t.title}
                    width={28}
                    height={28}
                    className="rounded-none border border-black shadow-[1px_1px_0px_0px_black]"
                  />
                </td>
                <td
                  className={cn(
                    "p-2 align-middle font-sans font-black text-black cursor-pointer hover:underline",
                    "sticky left-[3rem] z-10 bg-white border-r-4 border-black"
                  )}
                  onClick={() => expandCard(t)}
                >
                  {t.type}
                </td>
                <td
                  className={cn(
                    "p-2 align-middle text-gray-800 font-bold truncate whitespace-nowrap"
                  )}
                  title={t.nickname}
                >
                  {t.nickname}
                </td>
                <td className="p-2 align-middle font-mono font-bold text-gray-800 truncate whitespace-nowrap">
                  {t.cognitiveFunctions}
                </td>
                <td className="p-2 align-middle text-gray-800 font-medium">
                  <CarouselCell items={t.surfaceTraits || []} />
                </td>
                <td className="p-2 align-middle text-gray-800 font-medium">
                  <CarouselCell items={t.actualTraits || []} />
                </td>
                <td className="p-2 align-middle text-gray-800 font-medium">
                  <CarouselCell items={t.strengths || []} />
                </td>
                <td className="p-2 align-middle text-gray-800 font-medium">
                  <CarouselCell items={t.weaknesses || []} />
                </td>
                <td className="p-2 align-middle text-gray-800 font-bold">
                  {(t.bestPartners || []).length > 0 ? (
                    <span className="block truncate">
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

      <p className="text-[10px] text-gray-600 font-bold">
        提示：点击类型代码可展开详细性格卡片；表面特征/实际特征/优势/弱点会自动轮播显示；搜索会同时过滤匹配所有字段。
      </p>
    </div>
  );
}
