"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { mbtiTypes } from "@/data/core/mbti-data";
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
    <section className="flex flex-col lg:h-full lg:min-h-0">
      <header className="rule-b mb-3 shrink-0 pb-3 sm:mb-16 sm:pb-8 lg:mb-8 lg:pb-5">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">Function Analysis</span>
            <h2
              className="display mt-2 text-ink sm:mt-4 lg:mt-3"
              style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.75rem)" }}
            >
              按主导功能分组
            </h2>
          </div>
          <p className="max-w-[42ch] text-[0.8125rem] leading-relaxed text-ink-soft sm:text-[0.875rem] sm:leading-[1.8] lg:text-right">
            每两个类型共享同一个主导功能——他们看世界的第一反应是同一种。
          </p>
        </div>
      </header>

      <div className="scroll-quiet grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14 lg:min-h-0 lg:flex-1 lg:grid-cols-4 lg:gap-y-5 lg:overflow-y-auto">
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
              <div className="rule-t pt-2.5 sm:pt-4">
                <span
                  className="text-2xl font-medium leading-none tracking-tight sm:text-3xl lg:text-4xl"
                  style={{ color: accent }}
                >
                  {group.code}
                </span>
                <p className="mt-1 text-[0.8125rem] font-medium text-ink sm:mt-3 sm:text-[0.9375rem]">{group.name}</p>
                <p className="mt-0.5 line-clamp-1 text-[0.6875rem] leading-relaxed text-ink-ghost sm:line-clamp-none sm:mt-1.5 sm:text-[0.8125rem]">
                  {group.description}
                </p>
              </div>

              <div className="mt-2 sm:mt-3">
                {groupTypes.map((type) => (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => expandCard(type)}
                    className="rule-t flex w-full items-center gap-2 py-1.5 text-left transition-opacity hover:opacity-60 sm:gap-4 sm:py-2.5"
                  >
                    <span
                      className="relative h-8 w-8 shrink-0 overflow-hidden sm:h-12 sm:w-12"
                      style={{ backgroundColor: accentWash(type.group) }}
                    >
                      <Image
                        src={`/mbti_img/${type.image}`}
                        alt={type.type}
                        fill
                        sizes="(max-width: 640px) 32px, 48px"
                        className="object-contain object-bottom"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-none tracking-tight text-ink sm:text-lg">
                        {type.type}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.6875rem] text-ink-faint sm:mt-1.5 sm:text-[0.8125rem]">
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
