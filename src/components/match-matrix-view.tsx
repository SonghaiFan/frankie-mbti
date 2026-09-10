"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { mbtiTypes, mbtiMatches } from "@/data/mbti-data";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";
import { accentOf, accentWash } from "@/styles/mbti-styles";

const orderedTypes = [
  "INFP", "ENFP", "INFJ", "ENFJ",
  "INTJ", "ENTJ", "INTP", "ENTP",
  "ISFP", "ESFP", "ISTP", "ESTP",
  "ISFJ", "ESFJ", "ISTJ", "ESTJ",
];

/** Compatibility is read as ink density — one hue, five weights. */
const tiers = {
  灵魂伴侣: { alpha: 0.17, range: "90–100", note: "完美契合的理想配对" },
  天作之合: { alpha: 0.12, range: "70–89", note: "和谐稳定的默契搭档" },
  有趣搭配: { alpha: 0.075, range: "50–69", note: "充满惊喜的奇妙组合" },
  互补成长: { alpha: 0.038, range: "30–49", note: "在差异中共同学习进步" },
  欢喜冤家: { alpha: 0, range: "0–29", note: "极具挑战但有趣的张力关系" },
} as const;

type TierName = keyof typeof tiers;

const tierOf = (score: number): TierName => {
  if (score >= 90) return "灵魂伴侣";
  if (score >= 70) return "天作之合";
  if (score >= 50) return "有趣搭配";
  if (score >= 30) return "互补成长";
  return "欢喜冤家";
};

const CELL = 72;

export function MatchMatrixView() {
  const expandCard = useMBTIStore((state) => state.expandCard);
  const [hoveredCell, setHoveredCell] = useState<{ type1: string; type2: string } | null>(null);
  const [compatibilityData, setCompatibilityData] = useState<
    Array<{ type1: string; type2: string; label: string; score: number }> | null
  >(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [selectedCol, setSelectedCol] = useState<string | null>(null);

  useEffect(() => {
    fetch("/mbti_pairing_labels_matrix_flat.json")
      .then((response) => response.json())
      .then((data) => setCompatibilityData(data))
      .catch((error) => console.error("Error loading compatibility data:", error));
  }, []);

  const getJungPairInfo = (type1: string, type2: string) => {
    const match = mbtiMatches.find(
      (m) =>
        (m.pair[0] === type1 && m.pair[1] === type2) ||
        (m.pair[0] === type2 && m.pair[1] === type1)
    );
    return match
      ? { jungMatchType: match.matchType, jungDescription: match.description }
      : null;
  };

  const isOfficialBestPair = (type1: string, type2: string) => {
    const a = mbtiTypes.find((t) => t.type === type1);
    const b = mbtiTypes.find((t) => t.type === type2);
    if (!a || !b) return false;
    return (a.bestPartners || []).includes(type2) || (b.bestPartners || []).includes(type1);
  };

  const getMatchInfo = (type1: string, type2: string) => {
    if (!compatibilityData) return null;
    const matchData = compatibilityData.find(
      (item) => item.type1 === type1 && item.type2 === type2
    );
    if (!matchData) return null;

    const jungInfo = getJungPairInfo(type1, type2);
    return {
      name: matchData.label,
      matchType: tierOf(matchData.score),
      compatibility: matchData.score,
      isOfficialBestPair: isOfficialBestPair(type1, type2),
      jungMatchType: jungInfo?.jungMatchType,
      jungDescription: jungInfo?.jungDescription,
    };
  };

  // With a row or column pinned, the other axis re-sorts by compatibility.
  const getSortedTypes = (baseType: string, isRow: boolean) => {
    if (!compatibilityData) return orderedTypes;
    return [...orderedTypes].sort((a, b) => {
      const scoreA = isRow
        ? getMatchInfo(baseType, a)?.compatibility || 0
        : getMatchInfo(a, baseType)?.compatibility || 0;
      const scoreB = isRow
        ? getMatchInfo(baseType, b)?.compatibility || 0
        : getMatchInfo(b, baseType)?.compatibility || 0;
      return scoreB - scoreA;
    });
  };

  const handleRowClick = (typeCode: string) => {
    setSelectedRow((prev) => (prev === typeCode ? null : typeCode));
  };

  const handleColClick = (typeCode: string) => {
    setSelectedCol((prev) => (prev === typeCode ? null : typeCode));
  };

  const displayedRowTypes = selectedCol ? getSortedTypes(selectedCol, false) : orderedTypes;
  const displayedColTypes = selectedRow ? getSortedTypes(selectedRow, true) : orderedTypes;

  const AxisLabel = ({
    typeCode,
    isSelected,
    onClick,
  }: {
    typeCode: string;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const type = mbtiTypes.find((t) => t.type === typeCode);
    const accent = accentOf(type?.group);

    return (
      <button
        type="button"
        onClick={onClick}
        style={{ width: CELL, height: CELL }}
        className="rule-l rule-t flex flex-none flex-col items-center justify-center gap-1 transition-opacity hover:opacity-60"
      >
        {type && (
          <span
            className="relative h-8 w-8 overflow-hidden"
            style={{ backgroundColor: accentWash(type.group) }}
          >
            <Image
              src={`/mbti_img/${type.image}`}
              alt={type.type}
              fill
              sizes="32px"
              className="object-contain object-bottom"
            />
          </span>
        )}
        <span
          className={cn(
            "text-[0.6875rem] tracking-tight transition-colors",
            isSelected ? "font-medium" : "text-ink-faint"
          )}
          style={{ color: isSelected ? accent : undefined }}
        >
          {typeCode}
        </span>
      </button>
    );
  };

  return (
    <section>
      <header className="rule-b mb-12 pb-8 sm:mb-16 sm:pb-10">
        <span className="eyebrow">Relation Matrix</span>
        <h2
          className="display mt-5 text-ink"
          style={{ fontSize: "clamp(1.875rem, 4.2vw, 3.25rem)" }}
        >
          配对关系矩阵
        </h2>
        <p className="mt-6 max-w-[52ch] text-[0.9375rem] leading-[1.8] text-ink-soft">
          16 × 16。颜色越深，契合度越高。点击行列标签可锁定并按契合度重排，悬停单元格查看荣格配对原理。
        </p>
        <p className="mt-4 text-[0.8125rem] text-ink-ghost sm:hidden">
          左右滑动查看完整矩阵
        </p>
      </header>

      <div className="scroll-quiet overflow-x-auto overflow-y-visible pb-4">
        <div className="inline-block min-w-full">
          <div className="rule-r rule-b inline-block">
            {/* Column axis */}
            <div className="flex">
              <div
                className="rule-l rule-t flex-none"
                style={{ width: CELL, height: CELL }}
              />
              {displayedColTypes.map((typeCode) => (
                <AxisLabel
                  key={`col-${typeCode}`}
                  typeCode={typeCode}
                  isSelected={selectedCol === typeCode}
                  onClick={() => handleColClick(typeCode)}
                />
              ))}
            </div>

            {/* Rows */}
            {displayedRowTypes.map((rowType, rowIndex) => (
              <div key={`row-${rowType}`} className="flex">
                <AxisLabel
                  typeCode={rowType}
                  isSelected={selectedRow === rowType}
                  onClick={() => handleRowClick(rowType)}
                />

                {displayedColTypes.map((colType, colIndex) => {
                  const matchInfo = getMatchInfo(rowType, colType);
                  const isHovered =
                    hoveredCell?.type1 === rowType && hoveredCell?.type2 === colType;
                  const isAxisHit = selectedRow === rowType || selectedCol === colType;
                  const isIntersection = selectedRow === rowType && selectedCol === colType;
                  const tier = matchInfo ? tiers[matchInfo.matchType] : null;
                  const strong = matchInfo ? matchInfo.compatibility >= 70 : false;

                  return (
                    <div
                      key={`${rowType}-${colType}`}
                      onMouseEnter={() => setHoveredCell({ type1: rowType, type2: colType })}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => {
                        const type = mbtiTypes.find((t) => t.type === rowType);
                        if (type) expandCard(type);
                      }}
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: tier
                          ? `rgba(17,17,17,${tier.alpha + (isAxisHit ? 0.05 : 0)})`
                          : undefined,
                      }}
                      className={cn(
                        "rule-l rule-t relative flex flex-none cursor-pointer flex-col items-center justify-center gap-1 px-1 text-center transition-colors duration-200",
                        isIntersection && "z-[10] outline outline-1 outline-ink",
                        isHovered && "z-[20] outline outline-1 outline-ink"
                      )}
                    >
                      {matchInfo && (
                        <>
                          <span
                            className={cn(
                              "block max-w-full truncate text-[0.6875rem] leading-tight",
                              strong ? "text-ink" : "text-ink-soft"
                            )}
                          >
                            {matchInfo.name}
                          </span>
                          <span className="text-[0.625rem] tabular-nums text-ink-faint">
                            {matchInfo.compatibility}
                          </span>
                        </>
                      )}

                      {isHovered && matchInfo && (
                        <div
                          className={cn(
                            "pointer-events-none absolute z-[100] w-80 bg-paper p-6 text-left shadow-[0_24px_64px_-24px_rgba(0,0,0,0.35)]",
                            "border border-rule",
                            colIndex > displayedColTypes.length / 2 ? "right-0" : "left-0",
                            rowIndex < displayedRowTypes.length / 2
                              ? "top-full mt-2"
                              : "bottom-full mb-2"
                          )}
                        >
                          <div className="rule-b flex items-baseline justify-between gap-4 pb-3">
                            <span className="text-lg font-medium tracking-tight text-ink">
                              {rowType} × {colType}
                            </span>
                            <span className="text-lg tabular-nums text-ink-faint">
                              {matchInfo.compatibility}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-[0.9375rem] font-medium text-ink">
                              {matchInfo.name}
                            </span>
                            <span className="eyebrow">{matchInfo.matchType}</span>
                          </div>

                          {matchInfo.isOfficialBestPair && (
                            <p className="mt-3 text-[0.8125rem] text-ink-soft">
                              官方推荐理想配对
                            </p>
                          )}

                          {matchInfo.jungMatchType && (
                            <div className="rule-t mt-4 pt-4">
                              <span className="eyebrow">
                                荣格配对 · {matchInfo.jungMatchType}
                              </span>
                              {matchInfo.jungDescription && (
                                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                                  {matchInfo.jungDescription}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16"
      >
        <span className="eyebrow">Legend</span>
        <div className="mt-6 grid grid-cols-1 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(tiers).map(([name, config]) => (
            <div key={name} className="rule-t flex items-start gap-4 py-4">
              <span
                className="mt-1 h-6 w-6 flex-none border border-rule"
                style={{ backgroundColor: `rgba(17,17,17,${config.alpha})` }}
              />
              <div className="min-w-0">
                <p className="text-[0.9375rem] text-ink">
                  {name}
                  <span className="ml-2 text-[0.8125rem] tabular-nums text-ink-ghost">
                    {config.range}
                  </span>
                </p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-ghost">
                  {config.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
