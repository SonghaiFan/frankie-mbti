"use client";

import { useMemo, useState } from "react";
import { mbtiTypes } from "@/data/mbti-data";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMBTIStore } from "@/store/mbti-store";
import { mbtiGroupColors } from "@/styles/mbti-styles";

interface Column {
  key: string;
  label: string;
  width?: string;
  className?: string;
}

const columns: Column[] = [
  { key: "type", label: "类型", width: "w-20", className: "font-mono" },
  { key: "title", label: "称谓", width: "w-28" },
  { key: "group", label: "组别", width: "w-24" },
  { key: "nickname", label: "昵称", width: "w-40" },
  { key: "cognitiveFunctions", label: "认知功能", width: "w-44 font-mono" },
  { key: "strengthTop1", label: "优势Top1", width: "w-44" },
  { key: "weaknessTop1", label: "弱点Top1", width: "w-44" },
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
        ...(t.strengths || []),
        ...(t.weaknesses || []),
        ...(t.bestPartners || []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

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
          placeholder="搜索 类型/称谓/组别/昵称/功能/配对..."
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/50 w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 z-10">
            <tr>
              <th className="w-12 p-2" />
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "text-left font-medium text-gray-700 dark:text-gray-300 p-2",
                    c.width
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.type}
                className="even:bg-gray-50/50 dark:even:bg-gray-800/20 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="p-2 align-middle">
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
                    "p-2 align-middle font-mono font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                  )}
                  onClick={() => expandCard(t)}
                >
                  {t.type}
                </td>
                <td className="p-2 align-middle text-gray-800 dark:text-gray-200">
                  {t.title}
                </td>
                <td className="p-2 align-middle text-gray-700 dark:text-gray-300">
                  <span
                    className={cn(
                      "inline-block w-4 h-4 rounded mr-2 align-middle border",
                      mbtiGroupColors[t.color as keyof typeof mbtiGroupColors]
                        ?.bg,
                      mbtiGroupColors[t.color as keyof typeof mbtiGroupColors]
                        ?.border
                    )}
                    title={t.group}
                  />
                  {t.group}
                </td>
                <td
                  className="p-2 align-middle text-gray-700 dark:text-gray-300 truncate max-w-[240px]"
                  title={t.nickname}
                >
                  {t.nickname}
                </td>
                <td className="p-2 align-middle font-mono text-gray-800 dark:text-gray-200">
                  {t.cognitiveFunctions}
                </td>
                <td
                  className="p-2 align-middle text-gray-700 dark:text-gray-300 truncate max-w-[240px]"
                  title={(t.strengths && t.strengths[0]) || ""}
                >
                  {(t.strengths && t.strengths[0]) || "—"}
                </td>
                <td
                  className="p-2 align-middle text-gray-700 dark:text-gray-300 truncate max-w-[240px]"
                  title={(t.weaknesses && t.weaknesses[0]) || ""}
                >
                  {(t.weaknesses && t.weaknesses[0]) || "—"}
                </td>
                <td className="p-2 align-middle text-gray-700 dark:text-gray-300">
                  {(t.bestPartners || []).length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded ">
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
        提示：点击类型代码可打开该类型的详细卡片；官方最佳配对来自
        `bestPartners`。
      </p>
    </div>
  );
}
