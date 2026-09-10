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
      <h4 className="eyebrow">{title}</h4>
      <ul className="mt-4">
        {items.map((item) => (
          <li
            key={item}
            className="rule-t py-3 text-[0.9375rem] leading-relaxed text-ink-soft"
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
      >
        <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {dimensions.map((dimension, index) => {
            const selected = letters[index];

            return (
              <div key={dimension.name}>
                <h4 className="eyebrow">{dimension.name}</h4>

                <div className="mt-4">
                  {dimension.options.map((option) => {
                    const isSelected = option.type === selected;
                    return (
                      <div
                        key={option.type}
                        className={cn(
                          "rule-t py-5 transition-opacity duration-300",
                          isSelected ? "opacity-100" : "opacity-45"
                        )}
                      >
                        <div className="flex items-baseline gap-3">
                          <span
                            className="text-3xl font-medium leading-none tracking-tight"
                            style={{ color: isSelected ? accent : undefined }}
                          >
                            {option.type}
                          </span>
                          <span
                            className={cn(
                              "text-[0.9375rem]",
                              isSelected ? "text-ink" : "text-ink-soft"
                            )}
                          >
                            {option.name}
                          </span>
                        </div>

                        <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-soft">
                          {option.description}
                        </p>
                        <p className="mt-1.5 text-[0.8125rem] text-ink-ghost">
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
        <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
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
