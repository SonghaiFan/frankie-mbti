"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { cognitiveFunctions, mbtiTypes } from "@/data/core/mbti-data";
import type { MBTIType } from "@/types/mbti";
import { useMBTIStore } from "@/store/mbti-store";
import { accentOf, accentWash } from "@/styles/mbti-styles";

const ORDER = ["Ni", "Ne", "Ti", "Te", "Fi", "Fe", "Si", "Se"];
const INFERIOR = cognitiveFunctions.levels[3];
const { judging, perceiving } = cognitiveFunctions.categories;
const FUNCTIONS = { ...judging.functions, ...perceiving.functions };

/** The two types that lead with a function, in the order the type list uses. */
const leadersOf = (code: string) => mbtiTypes.filter((t) => t.cognitiveFunctions.startsWith(code));

/** The inferior (slot 4) is the other end of the dominant's axis: Ni ↔ Se, Ti ↔ Fe … */
const inferiorOf = (code: string) => {
  const axis = cognitiveFunctions.axes.find((ax) => ax.a === code || ax.b === code);
  return axis ? (axis.a === code ? axis.b : axis.a) : "";
};

function TypeChip({ type, onClick }: { type: MBTIType; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center gap-2 text-left transition-opacity hover:opacity-60 sm:gap-3"
    >
      <span
        className="relative h-9 w-9 shrink-0 overflow-hidden sm:h-12 sm:w-12"
        style={{ backgroundColor: accentWash(type.group) }}
      >
        <Image
          src={`/mbti_img/${type.image}`}
          alt={type.type}
          fill
          sizes="(max-width: 640px) 36px, 48px"
          className="object-contain object-bottom"
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-none tracking-tight text-ink sm:text-base">{type.type}</span>
        <span className="mt-1 block truncate text-[0.6875rem] text-ink-faint sm:text-[0.75rem]">
          {type.nickname.split("、")[0]} · {type.cognitiveFunctions}
        </span>
      </span>
    </button>
  );
}

/** One labelled paragraph of the reading. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rule-t grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-6 sm:py-4">
      <span className="eyebrow text-[0.625rem] sm:pt-1 sm:text-[0.6875rem]">{label}</span>
      <div className="max-w-[68ch] text-[0.8125rem] leading-[1.75] text-ink-soft sm:text-[0.9375rem] sm:leading-[1.85]">
        {children}
      </div>
    </div>
  );
}

export function DominantFunctionsView() {
  const expandCard = useMBTIStore((state) => state.expandCard);

  return (
    <section className="flex flex-col lg:h-full lg:min-h-0">
      <header className="rule-b mb-3 shrink-0 pb-3 sm:mb-12 sm:pb-8 lg:mb-6 lg:pb-5">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">Dominant Functions</span>
            <h2 className="display mt-2 text-ink sm:mt-4 lg:mt-3" style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.75rem)" }}>
              八个主导功能
            </h2>
          </div>
          <p className="max-w-[42ch] text-[0.8125rem] leading-relaxed text-ink-soft sm:text-[0.875rem] sm:leading-[1.8] lg:text-right">
            每两个类型共享同一个主导功能——看世界的第一反应是同一种，差别在第二个功能怎么接。
          </p>
        </div>
      </header>

      <div className="scroll-quiet lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {ORDER.map((code, index) => {
          const fn = FUNCTIONS[code as keyof typeof FUNCTIONS];
          const leaders = leadersOf(code);
          const accent = accentOf(leaders[0]?.group);
          const d = fn.asDominant;

          return (
            <motion.article
              key={code}
              id={code}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 gap-4 py-6 sm:py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:gap-16 lg:py-12"
            >
              {/* Who leads with it */}
              <div className="rule-t pt-3 sm:pt-5">
                <span
                  className="text-4xl font-medium leading-none tracking-tight sm:text-5xl"
                  style={{ color: accent }}
                >
                  {code}
                </span>
                <p className="mt-2 text-[0.9375rem] font-medium text-ink sm:mt-4 sm:text-lg">{fn.name}主导</p>
                <p className="mt-1 max-w-[36ch] text-[0.8125rem] leading-relaxed text-ink-soft sm:mt-2 sm:text-[0.875rem]">
                  {fn.description}
                </p>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-ghost sm:text-[0.8125rem]">{fn.definition}</p>

                <div className="mt-3 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
                  {leaders.map((type) => (
                    <TypeChip key={type.type} type={type} onClick={() => expandCard(type)} />
                  ))}
                </div>
              </div>

              {/* The reading */}
              <div>
                <Row label="它在做什么">{d.how}</Row>
                <Row label="日常的样子">
                  <ul className="space-y-1">
                    {d.looks.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="shrink-0 text-ink-ghost">·</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </Row>
                <Row label="两张脸">{d.twoFaces}</Row>
                <Row label="感情里">{d.inLove}</Row>
                <Row label="过头的时候">{d.overdrive}</Row>
                <Row label={`${INFERIOR.name.split(" ")[0]} · ${INFERIOR.cnRole} ${inferiorOf(code)}`}>{d.inferior}</Row>
                <Row label="怎么练">{d.grow}</Row>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
