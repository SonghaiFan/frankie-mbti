"use client";

import { MBTIType } from "@/types/mbti";
import { mbtiTypes } from "@/data/mbti-data";
import { accentOf } from "@/styles/mbti-styles";
import { Section } from "./section";

interface MBTIIntroductionProps {
  type: MBTIType;
}

export function MBTIIntroduction({ type }: MBTIIntroductionProps) {
  const accent = accentOf(type.group);
  const dominant = mbtiTypes
    .find((t) => t.type === type.type)
    ?.cognitiveFunctions.split(" ")[0];

  return (
    <Section label="Concepts" title="人设，与底层操作系统">
      <p
        className="max-w-[26ch] font-medium leading-[1.4] tracking-tight text-ink sm:leading-[1.45]"
        style={{ fontSize: "clamp(1.25rem, 3vw, 2.5rem)" }}
      >
        MBTI 是性格的人设，认知功能是大脑的操作系统。
      </p>

      <p className="mt-4 max-w-[52ch] text-[0.875rem] leading-[1.7] text-ink-soft sm:mt-12 sm:text-base sm:leading-[1.9]">
        你是{" "}
        <span
          className="border-b pb-0.5 font-medium text-ink"
          style={{ borderColor: accent }}
        >
          {type.type}
        </span>
        ，这是你的表现特征。而你的核心主导功能是{" "}
        <span
          className="border-b pb-0.5 font-medium text-ink"
          style={{ borderColor: accent }}
        >
          {dominant}
        </span>
        ，它解释了思维的内在运作机制。
      </p>

      {type.energyModel && (
        <div className="mt-6 max-w-[52ch] rounded-xl bg-ink/5 p-4 sm:p-5 border border-rule">
          <span className="eyebrow text-[0.6875rem] text-ink-soft">底层能量运转机制</span>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink font-medium">
            {type.energyModel}
          </p>
        </div>
      )}
    </Section>
  );
}
