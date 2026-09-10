"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { mbtiTypes } from "@/data/mbti-data";
import { useMBTIStore } from "@/store/mbti-store";
import { accentOf, accentWash } from "@/styles/mbti-styles";

const dominantGroups = [
  { code: "Ni", name: "内向直觉主导", description: "深度洞察与远见规划者", types: ["INTJ", "INFJ"] },
  { code: "Ne", name: "外向直觉主导", description: "创新探索与可能性发现者", types: ["ENTP", "ENFP"] },
  { code: "Ti", name: "内向思维主导", description: "逻辑分析与理论建构者", types: ["INTP", "ISTP"] },
  { code: "Te", name: "外向思维主导", description: "系统组织与高效执行者", types: ["ENTJ", "ESTJ"] },
  { code: "Fi", name: "内向情感主导", description: "价值坚守与真实表达者", types: ["INFP", "ISFP"] },
  { code: "Fe", name: "外向情感主导", description: "和谐协调与关爱他人者", types: ["ENFJ", "ESFJ"] },
  { code: "Si", name: "内向感觉主导", description: "经验积累与稳定守护者", types: ["ISTJ", "ISFJ"] },
  { code: "Se", name: "外向感觉主导", description: "当下体验与灵活应变者", types: ["ESTP", "ESFP"] },
];

export function DominantFunctionsView() {
  const expandCard = useMBTIStore((state) => state.expandCard);

  return (
    <section>
      <header className="rule-b mb-14 pb-8 sm:mb-20 sm:pb-10">
        <span className="eyebrow">Function Analysis</span>
        <h2
          className="display mt-5 text-ink"
          style={{ fontSize: "clamp(1.875rem, 4.2vw, 3.25rem)" }}
        >
          按主导功能分组
        </h2>
        <p className="mt-6 max-w-[46ch] text-[0.9375rem] leading-[1.8] text-ink-soft">
          每两个类型共享同一个主导功能——他们看世界的第一反应是同一种。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {dominantGroups.map((group, index) => {
          const groupTypes = mbtiTypes.filter((t) => group.types.includes(t.type));
          const accent = accentOf(groupTypes[0]?.group);

          return (
            <motion.div
              key={group.code}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                delay: Math.min(index * 0.05, 0.25),
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="rule-t pt-5">
                <span
                  className="text-4xl font-medium leading-none tracking-tight"
                  style={{ color: accent }}
                >
                  {group.code}
                </span>
                <p className="mt-3 text-[0.9375rem] text-ink">{group.name}</p>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-ghost">
                  {group.description}
                </p>
              </div>

              <div className="mt-6">
                {groupTypes.map((type) => (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => expandCard(type)}
                    className="rule-t flex w-full items-center gap-4 py-4 text-left transition-opacity hover:opacity-60"
                  >
                    <span
                      className="relative h-12 w-12 shrink-0 overflow-hidden"
                      style={{ backgroundColor: accentWash(type.group) }}
                    >
                      <Image
                        src={`/mbti_img/${type.image}`}
                        alt={type.type}
                        fill
                        sizes="48px"
                        className="object-contain object-bottom"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lg font-medium leading-none tracking-tight text-ink">
                        {type.type}
                      </span>
                      <span className="mt-1.5 block truncate text-[0.8125rem] text-ink-faint">
                        {type.title}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
