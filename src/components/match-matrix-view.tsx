"use client";

import { motion } from "motion/react";
import { mbtiTypes, mbtiMatches } from "@/data/mbti-data";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";
import { useState, useEffect } from "react";
import Image from "next/image";

// 16种MBTI类型按逻辑顺序排列
const orderedTypes = [
  "INFP",
  "ENFP",
  "INFJ",
  "ENFJ",
  "INTJ",
  "ENTJ",
  "INTP",
  "ENTP",
  "ISFP",
  "ESFP",
  "ISTP",
  "ESTP",
  "ISFJ",
  "ESFJ",
  "ISTJ",
  "ESTJ",
];

// const orderedTypes = [
//   "INTJ",
//   "INTP",
//   "ENTJ",
//   "ENTP",
//   "INFJ",
//   "INFP",
//   "ENFJ",
//   "ENFP",
//   "ISTJ",
//   "ISFJ",
//   "ESTJ",
//   "ESFJ",
//   "ISTP",
//   "ISFP",
//   "ESTP",
//   "ESFP",
// ];

// 配对类型的颜色和优先级（基于配对度）- 纯色色块，符合包豪斯几何色块分割
const matchTypePriority = {
  灵魂伴侣: {
    priority: 1,
    color: "bg-[#D02020] text-white border-2 border-black",
  },
  天作之合: {
    priority: 2,
    color: "bg-[#1040C0] text-white border-2 border-black",
  },
  有趣搭配: {
    priority: 3,
    color: "bg-[#F0C020] text-black border-2 border-black",
  },
  互补成长: {
    priority: 4,
    color: "bg-[#E0E0E0] text-black border-2 border-black",
  },
  欢喜冤家: {
    priority: 5,
    color: "bg-white text-[#121212] border-2 border-black",
  },
};

export function MatchMatrixView() {
  const expandCard = useMBTIStore((state) => state.expandCard);
  const [hoveredCell, setHoveredCell] = useState<{
    type1: string;
    type2: string;
  } | null>(null);
  const [compatibilityData, setCompatibilityData] = useState<Array<{
    type1: string;
    type2: string;
    label: string;
    score: number;
  }> | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  const [sortByCompatibility, setSortByCompatibility] = useState(false);

  // 加载配对数据
  useEffect(() => {
    fetch("/mbti_pairing_labels_matrix_flat.json")
      .then((response) => response.json())
      .then((data) => setCompatibilityData(data))
      .catch((error) =>
        console.error("Error loading compatibility data:", error)
      );
  }, []);

  // 荣格配对：从 mbtiMatches 查找配对类型与描述
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

  // 官方配对：以每个 MBTIType 中的 bestPartners 作为官方最佳配对
  const isOfficialBestPair = (type1: string, type2: string) => {
    const a = mbtiTypes.find((t) => t.type === type1);
    const b = mbtiTypes.find((t) => t.type === type2);
    if (!a || !b) return false;
    const aList = a.bestPartners || [];
    const bList = b.bestPartners || [];
    return aList.includes(type2) || bList.includes(type1);
  };

  // 获取配对信息
  const getMatchInfo = (type1: string, type2: string) => {
    if (!compatibilityData) {
      return null;
    }

    // 在扁平数组中查找匹配的配对
    const matchData = compatibilityData.find(
      (item) => item.type1 === type1 && item.type2 === type2
    );

    if (!matchData) {
      return null;
    }

    // 荣格配对信息
    const jungInfo = getJungPairInfo(type1, type2);

    return {
      name: matchData.label,
      matchType: getMatchTypeFromCompatibility(matchData.score),
      description: `配对度: ${matchData.score}%`,
      compatibility: matchData.score,
      // 官方最佳配对（基于 bestPartners）
      isOfficialBestPair: isOfficialBestPair(type1, type2),
      // 荣格配对信息（来源于 mbtiMatches）
      jungMatchType: jungInfo?.jungMatchType,
      jungDescription: jungInfo?.jungDescription,
    };
  };

  // 根据配对度确定配对类型 - 使用范围判断而非硬边界
  const getMatchTypeFromCompatibility = (compatibility: number) => {
    if (compatibility >= 90) return "灵魂伴侣";
    if (compatibility >= 70) return "天作之合";
    if (compatibility >= 50) return "有趣搭配";
    if (compatibility >= 30) return "互补成长";
    return "欢喜冤家";
  };

  // 获取类型的颜色
  const getTypeColor = (typeCode: string) => {
    const type = mbtiTypes.find((t) => t.type === typeCode);
    if (!type) return "text-[#121212]";

    switch (type.group) {
      case "分析师":
        return "text-mbti-nt";
      case "外交官":
        return "text-mbti-nf";
      case "守护者":
        return "text-mbti-sj";
      case "探险家":
        return "text-amber-600 font-bold";
      default:
        return "text-[#121212]";
    }
  };

  // 按兼容度排序类型
  const getSortedTypes = (baseType: string, isRow: boolean) => {
    if (!sortByCompatibility || !compatibilityData) {
      return orderedTypes;
    }

    return [...orderedTypes].sort((a, b) => {
      const scoreA = isRow
        ? getMatchInfo(baseType, a)?.compatibility || 0
        : getMatchInfo(a, baseType)?.compatibility || 0;
      const scoreB = isRow
        ? getMatchInfo(baseType, b)?.compatibility || 0
        : getMatchInfo(b, baseType)?.compatibility || 0;
      return scoreB - scoreA; // 降序排列
    });
  };

  // 处理行/列选择
  const handleRowClick = (typeCode: string) => {
    const type = mbtiTypes.find((t) => t.type === typeCode);
    if (type) expandCard(type);

    if (selectedRow === typeCode) {
      setSelectedRow(null);
    } else {
      setSelectedRow(typeCode);
    }
    // 只要有选中的行或列就启用排序
    setSortByCompatibility(
      !!(selectedRow !== typeCode ? typeCode : null) || !!selectedCol
    );
  };

  const handleColClick = (typeCode: string) => {
    const type = mbtiTypes.find((t) => t.type === typeCode);
    if (type) expandCard(type);

    if (selectedCol === typeCode) {
      setSelectedCol(null);
    } else {
      setSelectedCol(typeCode);
    }
    // 只要有选中的行或列就启用排序
    setSortByCompatibility(
      !!selectedRow || !!(selectedCol !== typeCode ? typeCode : null)
    );
  };

  // 获取当前显示的类型顺序
  const displayedRowTypes = selectedCol
    ? getSortedTypes(selectedCol, false)
    : orderedTypes;
  const displayedColTypes = selectedRow
    ? getSortedTypes(selectedRow, true)
    : orderedTypes;

  return (
    <div className="mb-12 px-2 sm:px-0">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-[#121212] mb-3">
          MBTI 配对关系矩阵 / RELATION MATRIX
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 font-bold max-w-2xl mx-auto px-4 leading-relaxed">
          16×16 交互式配对矩阵：点击行列标签可进行高亮与自动排序，悬浮单元格可查看详细契合度分析与荣格心理学配对原理。
        </p>
        <div className="block sm:hidden text-xs text-[#D02020] font-black uppercase tracking-wider mt-3">
          ⚡️ 左右滑动以查看完整矩阵
        </div>
      </motion.div>

      {/* 配对矩阵 */}
      <div
        className="overflow-x-auto overflow-y-hidden flex justify-center relative py-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div className="inline-block shrink-0">
          {/* 表格容器 */}
          <div className="border-4 border-black rounded-none overflow-visible relative shadow-[8px_8px_0px_0px_rgba(18,18,18,1)] bg-white">
            {/* 顶部类型标签行 */}
            <div className="flex bg-[#F0F0F0] border-b-4 border-black">
              {/* 左上角空白 */}
              <div className="w-16 h-16 flex-none border-r-4 border-black bg-[#E0E0E0]"></div>

              {/* 顶部类型标签 */}
              {displayedColTypes.map((typeCode, index) => {
                const type = mbtiTypes.find((t) => t.type === typeCode);
                const isLastColumn = index === displayedColTypes.length - 1;

                return (
                  <motion.button
                    key={`top-${typeCode}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => handleColClick(typeCode)}
                    className={cn(
                      "w-16 h-16 flex-none flex flex-col items-center justify-center transition-colors cursor-pointer",
                      !isLastColumn && "border-r-4 border-black",
                      "text-[10px] font-black uppercase tracking-tighter hover:bg-[#E0E0E0]",
                      getTypeColor(typeCode),
                      selectedCol === typeCode ? "bg-[#D02020] !text-white" : "bg-[#F0F0F0]"
                    )}
                  >
                    {type && (
                      <Image
                        src={`/mbti_img/${type.image}`}
                        alt={type.title}
                        width={36}
                        height={36}
                        className="mb-1 rounded-none border border-black shadow-[1px_1px_0px_0px_black]"
                      />
                    )}
                    <span className="text-[10px] font-black leading-none">{typeCode}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* 矩阵行 */}
            {displayedRowTypes.map((rowType, rowIndex) => {
              const rowTypeData = mbtiTypes.find((t) => t.type === rowType);
              const isLastRow = rowIndex === displayedRowTypes.length - 1;

              return (
                <div key={`row-${rowType}`} className="flex">
                  {/* 左侧类型标签 */}
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.01 }}
                    onClick={() => handleRowClick(rowType)}
                    className={cn(
                      "w-16 h-16 flex-none border-r-4",
                      !isLastRow && "border-b-4 border-black",
                      "flex flex-col items-center justify-center transition-colors cursor-pointer font-sans",
                      "text-[10px] font-black uppercase tracking-tighter hover:bg-[#E0E0E0]",
                      getTypeColor(rowType),
                      selectedRow === rowType ? "bg-[#D02020] !text-white" : "bg-[#F0F0F0]"
                    )}
                  >
                    {rowTypeData && (
                      <Image
                        src={`/mbti_img/${rowTypeData.image}`}
                        alt={rowTypeData.title}
                        width={36}
                        height={36}
                        className="mb-1 rounded-none border border-black shadow-[1px_1px_0px_0px_black]"
                      />
                    )}
                    <span className="text-[10px] font-black leading-none">{rowType}</span>
                  </motion.button>

                  {/* 配对单元格 */}
                  {displayedColTypes.map((colType, colIndex) => {
                    const matchInfo = getMatchInfo(rowType, colType);
                    const isHovered =
                      hoveredCell?.type1 === rowType &&
                      hoveredCell?.type2 === colType;
                    const isLastColumn =
                      colIndex === displayedColTypes.length - 1;
                    const isCellHighlighted =
                      selectedRow === rowType || selectedCol === colType;
                    const isIntersectionCell =
                      selectedRow === rowType && selectedCol === colType;

                    return (
                      <div
                        key={`${rowType}-${colType}`}
                        onMouseEnter={() =>
                          setHoveredCell({ type1: rowType, type2: colType })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={cn(
                          "w-16 h-16 flex-none border-black",
                          !isLastRow && "border-b-4",
                          !isLastColumn && "border-r-4",
                          "flex items-center justify-center cursor-pointer transition-all duration-150 rounded-none relative z-[1]",
                          matchInfo
                            ? cn(
                                matchTypePriority[
                                  matchInfo.matchType as keyof typeof matchTypePriority
                                ]?.color || "bg-white text-[#121212]"
                              )
                            : "bg-white text-[#121212] hover:bg-[#F0F0F0]",
                          // row/column highlighted active state
                          isCellHighlighted && "after:absolute after:inset-0 after:bg-black/10 z-[2]",
                          // intersection of highlighted row and column
                          isIntersectionCell && "outline outline-4 outline-black z-[10] scale-105 shadow-[4px_4px_0px_0px_black]",
                          // hovered state above all
                          isHovered && "z-[20] scale-110 shadow-[6px_6px_0px_0px_black] outline outline-4 outline-black"
                        )}
                      >
                        {matchInfo && (
                          <div className="text-center p-1 select-none">
                            <div className="text-[10px] font-black uppercase tracking-tighter leading-tight">
                              {matchInfo.name}
                            </div>
                            {matchInfo.compatibility && (
                              <div className="text-[9px] font-bold opacity-80 mt-0.5">
                                {matchInfo.compatibility}%
                              </div>
                            )}
                          </div>
                        )}

                        {/* 悬停提示 - Bauhaus Poster style */}
                        {isHovered && matchInfo && (
                          <div
                            className={cn(
                              "absolute z-[100] pointer-events-none",
                              "bg-white border-4 border-black text-[#121212]",
                              "rounded-none shadow-[8px_8px_0px_0px_black] p-4 w-72",
                              // 智能定位：根据位置调整方向
                              colIndex > displayedColTypes.length / 2
                                ? "right-0" // 右半部分向左显示
                                : "left-0", // 左半部分向右显示
                              rowIndex < displayedRowTypes.length / 2
                                ? "top-full mt-2" // 上半部分向下显示
                                : "bottom-full mb-2" // 下半部分向上显示
                            )}
                          >
                            <div className="text-sm font-black uppercase tracking-tighter text-[#121212] border-b-2 border-black pb-1.5 mb-2">
                              {rowType} × {colType}
                            </div>
                            <div className="text-xs font-black text-[#121212] mb-1">
                              配对关系：{matchInfo.name}
                            </div>
                            <div className="text-xs font-bold text-gray-700 mb-2">
                              契合指数：{matchInfo.compatibility}%
                            </div>

                            {/* 官方最佳配对 */}
                            {matchInfo.isOfficialBestPair && (
                              <div className="mb-2.5">
                                <span className="text-[9px] font-black uppercase tracking-tighter bg-mbti-nf text-white px-2 py-0.5 border border-black rounded-none">
                                  官方推荐理想配对 ★
                                </span>
                              </div>
                            )}

                            {/* 级别标签 */}
                            <div
                              className={cn(
                                "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 border border-black rounded-none mb-3 inline-block",
                                matchTypePriority[
                                  matchInfo.matchType as keyof typeof matchTypePriority
                                ]?.color || "bg-white text-black"
                              )}
                            >
                              {matchInfo.matchType}
                            </div>

                            {/* 荣格配对描述 */}
                            {matchInfo.jungMatchType && (
                              <div className="mt-2 pt-2 border-t border-black border-dashed">
                                <div className="text-[10px] font-black uppercase tracking-tight text-[#121212] mb-1">
                                  荣格配对类型：{matchInfo.jungMatchType}
                                </div>
                                {matchInfo.jungDescription && (
                                  <div className="text-[10px] text-gray-800 leading-relaxed font-medium">
                                    {matchInfo.jungDescription}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 图例 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_black] text-[#121212]"
      >
        <h3 className="font-black text-sm uppercase tracking-wider text-black border-b-4 border-black pb-2 mb-4">
          配对度分类图例 / COMPATIBILITY LEGEND
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(matchTypePriority).map(([matchType, config]) => (
            <div key={matchType} className="flex items-start gap-3">
              <div className={cn("w-6 h-6 flex-none rounded-none border-2 border-black shadow-[2px_2px_0px_0px_black]", config.color.split(' ')[0])}></div>
              <div className="text-xs leading-tight font-medium">
                <span className="font-black uppercase block mb-0.5">{matchType}</span>
                <span className="text-gray-700">
                  {matchType === "灵魂伴侣" && "90-100分 — 完美契合的理想配对"}
                  {matchType === "天作之合" && "70-89分 — 和谐稳定的默契搭档"}
                  {matchType === "有趣搭配" && "50-69分 — 充满惊喜的奇妙组合"}
                  {matchType === "互补成长" && "30-49分 — 在差异中共同学习进步"}
                  {matchType === "欢喜冤家" && "0-29分 — 极具挑战但有趣的张力关系"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs font-bold text-gray-800 mt-6 pt-4 border-t-2 border-dashed border-gray-300 flex items-center gap-2">
          <span className="bg-[#D02020] text-white w-2 h-2 rounded-full inline-block"></span>
          <span>提示：点击行或列标签进行高亮并自动进行降序兼容度排序，悬停单元格可了解详细契合度分析。</span>
        </div>
      </motion.div>
    </div>
  );
}
