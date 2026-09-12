"use client";

import { MBTIType } from "@/types/mbti";
import { dimensions } from "@/data/core/mbti-data";
import { accentOf } from "@/styles/mbti-styles";
import { Section } from "./section";
import { MBTIOfficialMatches } from "./mbti-matches";

interface MBTIDimensionsProps {
  type: MBTIType;
}

function TraitList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{title}</h4>
      <ul className="mt-2 sm:mt-4">
        {items.map((item) => (
          <li
            key={item}
            className="rule-t py-1.5 text-[0.8125rem] leading-relaxed text-ink-soft sm:py-3 sm:text-[0.9375rem]"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** E/I + J/P fix the dominant's attitude; T/F or S/N then names it. */
function deduceDominant(code: string) {
  const [e, sn, tf, jp] = code.split("");
  const judgingFirst = (e === "E") === (jp === "J");
  const fn = judgingFirst ? tf : sn;
  const attitude = e === "E" ? "e" : "i";
  return {
    dominant: `${fn}${attitude}`,
    reading: `${e} + ${jp} → 主导是${e === "E" ? "外向" : "内向"}的${judgingFirst ? "判断" : "知觉"}功能，由 ${fn} 决定`,
  };
}

export function MBTIDimensions({ type }: MBTIDimensionsProps) {
  const accent = accentOf(type.group);
  const letters = type.type.split("");
  const inference = deduceDominant(type.type);

  return (
    <>
      <Section
        label="Four Dimensions"
        title="四维解析"
      >
        {/* One letter per dimension — the type's own, nothing to compare against. */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-12 sm:gap-y-6 lg:grid-cols-4">
          {dimensions.map((dimension, index) => {
            const selected = letters[index];
            const option =
              dimension.options.find((o) => o.type === selected) ||
              dimension.options[0];

            return (
              <div key={dimension.name} className="rule-t pt-2.5 sm:pt-5">
                <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{dimension.name}</span>

                <div className="mt-1 sm:mt-3">
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span
                      className="text-2xl font-medium leading-none tracking-tight sm:text-3xl"
                      style={{ color: accent }}
                    >
                      {option.type}
                    </span>
                    <span className="text-[0.875rem] font-medium text-ink sm:text-[0.9375rem]">
                      {option.name}
                    </span>
                  </div>

                  <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-soft sm:mt-2.5 sm:text-[0.875rem]">
                    {option.description}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] text-ink-ghost sm:mt-1 sm:text-[0.8125rem]">
                    {option.mnemonic}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* The four letters already imply the dominant function — say so once, here. */}
        <div className="rule-t mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1.5 pt-3 sm:mt-8 sm:gap-x-6 sm:pt-5">
          <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">主导功能</span>
          <span className="text-2xl font-medium leading-none tracking-tight sm:text-3xl" style={{ color: accent }}>
            {inference.dominant}
          </span>
          <span className="text-[0.8125rem] text-ink-soft sm:text-[0.875rem]">{inference.reading}</span>
        </div>
      </Section>

      <Section label="Traits" title="性格特点">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-12 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4">
          <TraitList title="优点 Strengths" items={type.strengths} />
          <TraitList title="缺点 Weaknesses" items={type.weaknesses} />
          <TraitList title="表面特征 Surface" items={type.surfaceTraits} />
          <TraitList title="实际特征 Actual" items={type.actualTraits} />
        </div>
      </Section>

      <MBTIOfficialMatches type={type} />
    </>
  );
}
