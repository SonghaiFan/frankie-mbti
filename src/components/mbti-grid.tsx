"use client";

import { mbtiTypes } from "@/data/mbti-data";
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {Object.entries(groupedMBTIs).map(([group, mbtis], index) => (
        <div
          key={group}
          className="space-y-4 animate-slide-up"
          style={{ animationDelay: `${0.1 + index * 0.1}s` }}
        >
          <h2
            className={cn(
              "text-2xl font-medium mb-4 text-center transition-colors duration-300",
              group === "分析师" && "text-purple-800 dark:text-purple-400",
              group === "外交官" && "text-green-800 dark:text-green-400",
              group === "守护者" && "text-blue-800 dark:text-blue-400",
              group === "探险家" && "text-yellow-800 dark:text-yellow-400"
            )}
          >
            {group}
          </h2>
          <div className="grid gap-4">
            {mbtis.map((mbti, mbtiIndex) => (
              <div
                key={mbti.type}
                className="animate-slide-up"
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
      ))}
    </div>
  );
}
