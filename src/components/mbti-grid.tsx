"use client";

import { groupExplanations, mbtiTypes } from "@/data/mbti-data";
import { MBTICard } from "@/components/mbti-card";
import { cn } from "@/lib/utils";
import { useMBTIStore } from "@/store/mbti-store";

export function MBTIGrid() {
  const selectedType = useMBTIStore((state) => state.selectedType);
  const expandCard = useMBTIStore((state) => state.expandCard);
  const collapseCard = useMBTIStore((state) => state.collapseCard);

  // Group MBTI types by their group
  const groupedMBTIs = mbtiTypes.reduce((acc, mbti) => {
    const group = mbti.group;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(mbti);
    return acc;
  }, {} as Record<string, typeof mbtiTypes>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8 relative">
      {Object.entries(groupedMBTIs).map(([group, mbtis], index) => {
        const explanation =
          groupExplanations[group as keyof typeof groupExplanations];

        return (
          <div
            key={group}
            className={cn(
              "animate-slide-up rounded-2xl flex flex-col relative",
              explanation.bgColor,
              "hover:shadow-lg transition-shadow duration-200",
              mbtis.some(m => selectedType?.type === m.type) ? "z-[90]" : "z-[1]"
            )}
            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
          >
            <div className="p-6 flex flex-col h-[250px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2
                    className={cn(
                      "text-xl font-bold tracking-tight",
                      explanation.color
                    )}
                  >
                    {group}
                  </h2>
                  <span
                    className={cn(
                      "text-xs font-mono px-2 py-0.5 rounded-full",
                      explanation.bgColor,
                      explanation.color,
                      "bg-opacity-50 dark:bg-opacity-20"
                    )}
                  >
                    {explanation.keyLetters}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <div className="space-y-1.5 mb-4">
                  <p className="text-sm font-medium line-clamp-1">
                    {explanation.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {explanation.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-auto">
                  {explanation.coreKeywords.split("、").map((keyword, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        explanation.color,
                        "bg-white/80 dark:bg-white/10",
                        "shadow-sm"
                      )}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <div
                  className={cn(
                    "text-xs py-1 inline-flex items-center mt-3",
                    "text-muted-foreground"
                  )}
                >
                  <span className="font-medium">对应象限: </span>
                  <span className="font-mono ml-1.5">
                    {explanation.quadrant}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 px-6 pb-6">
              {mbtis.map((mbti, mbtiIndex) => (
                <div
                  key={mbti.type}
                  className={cn(
                    "animate-slide-up h-[100px]",
                    selectedType?.type === mbti.type ? "z-[100]" : "z-[1]"
                  )}
                  style={{
                    animationDelay: `${0.2 + index * 0.1 + mbtiIndex * 0.05}s`,
                  }}
                >
                  <MBTICard
                    type={mbti}
                    isExpanded={selectedType?.type === mbti.type}
                    onExpand={() => expandCard(mbti)}
                    onCollapse={collapseCard}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
