"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { mbtiTypes, colorGroups } from "@/data/core/mbti-data";
import { useMBTIStore } from "@/store/mbti-store";
import { accentOf, accentWash } from "@/styles/mbti-styles";

export function GroupsView() {
  const expandCard = useMBTIStore((state) => state.expandCard);

  return (
    <section className="flex flex-col lg:h-full lg:min-h-0">
      <header className="rule-b mb-3 shrink-0 pb-3 sm:mb-16 sm:pb-8 lg:mb-8 lg:pb-5">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">Four Quadrants</span>
            <h2
              className="display mt-2 text-ink sm:mt-4 lg:mt-3"
              style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.75rem)" }}
            >
              按性格色彩四大组别
            </h2>
          </div>
          <p className="max-w-[42ch] text-[0.8125rem] leading-relaxed text-ink-soft sm:text-[0.875rem] sm:leading-[1.8] lg:text-right">
            基于感知与判断维度的组合，16 种人格划分为四大色彩阵营——分析师、外交官、守护者与探险家。
          </p>
        </div>
      </header>

      <div className="scroll-quiet grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14 lg:min-h-0 lg:flex-1 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-5 lg:overflow-y-auto">
        {colorGroups.map((group, index) => {
          const groupTypes = mbtiTypes.filter((t) => group.types.includes(t.type));
          const accent = accentOf(group.name);

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
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-2xl font-medium leading-none tracking-tight sm:text-3xl lg:text-4xl"
                    style={{ color: accent }}
                  >
                    {group.code}
                  </span>
                  <span
                    className="eyebrow truncate text-[0.625rem] sm:text-[0.6875rem]"
                    style={{ color: accent }}
                  >
                    {group.nickname}
                  </span>
                </div>
                <p className="mt-1 text-[0.8125rem] font-medium text-ink sm:mt-3 sm:text-[0.9375rem]">
                  {group.name} · {group.formula}
                </p>
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
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-none tracking-tight text-ink sm:text-lg">
                        {type.type}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.6875rem] text-ink-faint sm:mt-1.5 sm:text-[0.8125rem]">
                        {type.title} · {type.nickname}
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
