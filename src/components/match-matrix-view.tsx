"use client";

import { motion } from "motion/react";
import { mbtiTypes, mbtiMatches } from "@/data/mbti-data";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";
import { useState, useEffect } from "react";
import Image from "next/image";

// 16种MBTI类型按逻辑顺序排列
const orderedTypes = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISTP",
  "ESTJ",
  "ESTP",
  "ISFJ",
  "ISFP",
  "ESFJ",
  "ESFP",
];

// 配对类型的颜色和优先级（基于配对度）- 红色到灰色渐变（越红越高）
const matchTypePriority = {
  灵魂伴侣: {
    priority: 1,
    color: "bg-red-400 text-red-900 dark:bg-red-600/50 dark:text-red-200",
  },
  天作之合: {
    priority: 2,
    color: "bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-300",
  },
  有趣搭配: {
    priority: 3,
    color: "bg-gray-300 text-gray-800 dark:bg-gray-500/50 dark:text-gray-300",
  },
  互补成长: {
    priority: 4,
    color: "bg-gray-200 text-gray-800 dark:bg-gray-600/50 dark:text-gray-300",
  },
  欢喜冤家: {
    priority: 5,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300",
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

  // 从 mbtiMatches 中查找匹配类型和描述
  const getMatchTypeInfo = (type1: string, type2: string) => {
    const match = mbtiMatches.find(
      (m) =>
        (m.pair[0] === type1 && m.pair[1] === type2) ||
        (m.pair[0] === type2 && m.pair[1] === type1)
    );
    return match
      ? { matchType: match.matchType, description: match.description }
      : null;
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

    // 从 mbtiMatches 中获取匹配类型和描述
    const matchTypeInfo = getMatchTypeInfo(type1, type2);

    return {
      name: matchData.label,
      matchType: getMatchTypeFromCompatibility(matchData.score),
      description: `配对度: ${matchData.score}%`,
      compatibility: matchData.score,
      // 添加来自 mbtiMatches 的信息
      officialMatchType: matchTypeInfo?.matchType,
      officialDescription: matchTypeInfo?.description,
    };
  };

  // 根据配对度确定配对类型
  const getMatchTypeFromCompatibility = (compatibility: number) => {
    if (compatibility === 100) return "灵魂伴侣";
    if (compatibility === 80) return "天作之合";
    if (compatibility === 60) return "有趣搭配";
    if (compatibility === 40) return "互补成长";
    return "欢喜冤家";
  };

  // 获取类型的颜色
  const getTypeColor = (typeCode: string) => {
    const type = mbtiTypes.find((t) => t.type === typeCode);
    if (!type) return "text-gray-600";

    switch (type.group) {
      case "分析师":
        return "text-purple-600 dark:text-purple-400";
      case "外交官":
        return "text-green-600 dark:text-green-400";
      case "守护者":
        return "text-blue-900 dark:text-blue-100";
      case "探险家":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600";
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
    <div className="mb-8 px-2 sm:px-0">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 sm:mb-6"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          MBTI 配对关系矩阵
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">
          16×16 配对矩阵：点击行列标签高亮并排序，悬停单元格查看配对详情
        </p>
        <div className="block sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 可以左右滑动查看完整矩阵
        </div>
      </motion.div>

      {/* 配对矩阵 */}
      <div
        className="overflow-x-auto overflow-y-hidden flex justify-center relative"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div className="inline-block shrink-0">
          {/* 表格容器 */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-visible relative ">
            {/* 顶部类型标签行 */}
            <div className="flex bg-gray-100 dark:bg-gray-800">
              {/* 左上角空白 */}
              <div className="w-16 h-16 flex-none border-r border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-900"></div>

              {/* 顶部类型标签 */}
              {displayedColTypes.map((typeCode, index) => {
                const type = mbtiTypes.find((t) => t.type === typeCode);
                const isLastColumn = index === displayedColTypes.length - 1;

                return (
                  <motion.button
                    key={`top-${typeCode}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleColClick(typeCode)}
                    className={cn(
                      "w-16 h-16 flex-none flex flex-col items-center justify-center",
                      !isLastColumn &&
                        "border-r border-gray-300 dark:border-gray-700",
                      "text-xs font-mono font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                      getTypeColor(typeCode),
                      selectedCol === typeCode &&
                        "bg-white dark:bg-white/10 ring-2 ring-white/60 dark:ring-white/40"
                    )}
                  >
                    {type && (
                      <Image
                        src={`/mbti_img/${type.image}`}
                        alt={type.title}
                        width={20}
                        height={20}
                        className="mb-1 rounded-full"
                      />
                    )}
                    <span className="text-[10px] leading-none">{typeCode}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* 矩阵行 */}
            {displayedRowTypes.map((rowType, rowIndex) => {
              const rowTypeData = mbtiTypes.find((t) => t.type === rowType);

              return (
                <div key={`row-${rowType}`} className="flex">
                  {/* 左侧类型标签 */}
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.02 }}
                    onClick={() => handleRowClick(rowType)}
                    className={cn(
                      "w-16 h-16 flex-none border-r border-b border-gray-300 dark:border-gray-700",
                      "flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800",
                      "text-xs font-mono font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                      getTypeColor(rowType),
                      selectedRow === rowType &&
                        "bg-white dark:bg-white/10 ring-2 ring-white/60 dark:ring-white/40"
                    )}
                  >
                    {rowTypeData && (
                      <Image
                        src={`/mbti_img/${rowTypeData.image}`}
                        alt={rowTypeData.title}
                        width={20}
                        height={20}
                        className="mb-1 rounded-full"
                      />
                    )}
                    <span className="text-[10px] leading-none">{rowType}</span>
                  </motion.button>

                  {/* 配对单元格 */}
                  {displayedColTypes.map((colType, colIndex) => {
                    const matchInfo = getMatchInfo(rowType, colType);
                    const isHovered =
                      hoveredCell?.type1 === rowType &&
                      hoveredCell?.type2 === colType;
                    const isLastColumn =
                      colIndex === displayedColTypes.length - 1;
                    const isLastRow = rowIndex === displayedRowTypes.length - 1;
                    const isCellHighlighted =
                      selectedRow === rowType || selectedCol === colType;
                    const isIntersectionCell =
                      selectedRow === rowType && selectedCol === colType;

                    return (
                      <motion.div
                        key={`${rowType}-${colType}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (rowIndex + colIndex) * 0.005 }}
                        onMouseEnter={() =>
                          setHoveredCell({ type1: rowType, type2: colType })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={cn(
                          "w-16 h-16 flex-none border-gray-300 dark:border-gray-700",
                          !isLastRow && "border-b",
                          !isLastColumn && "border-r",
                          "flex items-center justify-center cursor-pointer transition-all duration-200",
                          // base stacking context
                          "relative will-change-transform transform-gpu z-[1] hover:shadow-lg",
                          matchInfo
                            ? cn(
                                "hover:scale-[1.06]",
                                matchTypePriority[
                                  matchInfo.matchType as keyof typeof matchTypePriority
                                ]?.color || "bg-gray-50 dark:bg-gray-800"
                              )
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700",
                          // selected row/col under hovered
                          isCellHighlighted &&
                            "ring-1 ring-gray-800/70 dark:ring-white/30 z-[60]",
                          // hovered cell above selected
                          isHovered &&
                            "z-[70] shadow-xl transform scale-[1.06]",
                          // 避免改变尺寸导致纵向滚动：仅使用外发光，不加粗边框
                          isIntersectionCell &&
                            "ring-4 ring-gray-800 dark:ring-white/90 z-[80]"
                        )}
                      >
                        {matchInfo && (
                          <div className="text-center p-1">
                            <div className="text-xs font-medium leading-tight">
                              {matchInfo.name}
                            </div>
                            {matchInfo.compatibility && (
                              <div className="text-[10px] opacity-70 mt-0.5">
                                {matchInfo.compatibility}%
                              </div>
                            )}
                          </div>
                        )}

                        {/* 悬停提示 */}
                        {isHovered && matchInfo && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "absolute z-[100] pointer-events-none",
                              "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
                              "rounded-lg shadow-xl p-3 w-64",
                              // 智能定位：根据位置调整方向
                              colIndex > displayedColTypes.length / 2
                                ? "right-0 translate-x-0" // 右半部分向左显示
                                : "left-0 translate-x-0", // 左半部分向右显示
                              rowIndex < displayedRowTypes.length / 2
                                ? "top-full mt-2" // 上半部分向下显示
                                : "bottom-full mb-2" // 下半部分向上显示
                            )}
                          >
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {rowType} × {colType}
                            </div>
                            <div className="text-sm font-medium mt-1 text-gray-800 dark:text-gray-200">
                              配对名称：{matchInfo.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              配对度：{matchInfo.compatibility}%
                            </div>

                            {/* 显示基于配对度的分类 */}
                            <div
                              className={cn(
                                "text-xs px-2 py-1 rounded mt-2 inline-block",
                                matchTypePriority[
                                  matchInfo.matchType as keyof typeof matchTypePriority
                                ]?.color || "bg-gray-100 text-gray-800"
                              )}
                            >
                              {matchInfo.matchType}
                            </div>

                            {/* 显示来自 mbtiMatches 的官方匹配类型和描述 */}
                            {matchInfo.officialMatchType && (
                              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  官方匹配类型：{matchInfo.officialMatchType}
                                </div>
                                {matchInfo.officialDescription && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                    {matchInfo.officialDescription}
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
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
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
      >
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">
          配对度图例
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(matchTypePriority).map(([matchType, config]) => (
            <div key={matchType} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded", config.color)}></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {matchType === "灵魂伴侣" &&
                  "灵魂伴侣 (100分) - 完美契合的理想配对"}
                {matchType === "天作之合" &&
                  "天作之合 (80分) - 和谐美好的默契搭档"}
                {matchType === "有趣搭配" &&
                  "有趣搭配 (60分) - 充满惊喜的奇妙组合"}
                {matchType === "互补成长" &&
                  "互补成长 (40分) - 在差异中共同进步"}
                {matchType === "欢喜冤家" &&
                  "欢喜冤家 (20分) - 充满挑战的有趣关系"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
          💡 提示：点击行列标签进行高亮并按兼容度排序，悬停单元格查看详情
        </p>
      </motion.div>
    </div>
  );
}
