"use client";

import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import { dimensions } from "@/data/mbti-data";
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

export function MBTIDimensions({ type }: MBTIDimensionsProps) {
  const accent = accentOf(type.group);
  const letters = type.type.split("");

  return (
    <>
      <Section
        label="Four Dimensions"
        title="四维解析"
        note="加深的一项，是你的偏好所在。"
        noteClassName="hidden sm:block"
      >
        {/* Mobile: 2x2 grid showing only the corresponding trait for each dimension */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:hidden">
          {dimensions.map((dimension, index) => {
            const selected = letters[index];
            const option =
              dimension.options.find((o) => o.type === selected) ||
              dimension.options[0];

            return (
              <div key={dimension.name} className="rule-t pt-2.5">
                <span className="eyebrow text-[0.625rem]">{dimension.name}</span>

                <div className="mt-1">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-2xl font-medium leading-none tracking-tight"
                      style={{ color: accent }}
                    >
                      {option.type}
                    </span>
                    <span className="text-[0.875rem] font-medium text-ink">
                      {option.name}
                    </span>
                  </div>

                  <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-soft">
                    {option.description}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] text-ink-ghost">
                    {option.mnemonic}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tablet & Desktop: 4 columns comparing both options */}
        <div className="hidden gap-x-12 gap-y-6 sm:grid sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4">
          {dimensions.map((dimension, index) => {
            const selected = letters[index];

            return (
              <div key={dimension.name}>
                <h4 className="eyebrow text-[0.6875rem]">{dimension.name}</h4>

                <div className="mt-2 sm:mt-4">
                  {dimension.options.map((option) => {
                    const isSelected = option.type === selected;
                    return (
                      <div
                        key={option.type}
                        className={cn(
                          "rule-t py-3 transition-opacity duration-300 sm:py-5",
                          isSelected ? "opacity-100" : "opacity-45"
                        )}
                      >
                        <div className="flex items-baseline gap-2.5 sm:gap-3">
                          <span
                            className="text-2xl font-medium leading-none tracking-tight sm:text-3xl"
                            style={{ color: isSelected ? accent : undefined }}
                          >
                            {option.type}
                          </span>
                          <span
                            className={cn(
                              "text-[0.875rem] sm:text-[0.9375rem]",
                              isSelected ? "text-ink" : "text-ink-soft"
                            )}
                          >
                            {option.name}
                          </span>
                        </div>

                        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-soft sm:mt-3 sm:text-[0.875rem]">
                          {option.description}
                        </p>
                        <p className="mt-0.5 text-[0.75rem] text-ink-ghost sm:mt-1.5 sm:text-[0.8125rem]">
                          {option.mnemonic}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
