"use client";

import Image from "next/image";
import { MBTIType } from "@/types/mbti";
import { mbtiMatches, mbtiTypes, relationOf } from "@/data/core/mbti-data";
import { accentOf, accentWash } from "@/styles/mbti-styles";
import { useMBTIStore } from "@/store/mbti-store";
import { Section } from "./section";

interface MBTIMatchesProps {
  type: MBTIType;
}

/** Small portrait + code, borderless — used on both sides of a pairing. */
function TypeChip({
  type,
  onClick,
  align = "left",
}: {
  type: MBTIType;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/chip flex min-w-0 items-center gap-2.5 text-left transition-opacity hover:opacity-60 sm:gap-3 ${
        align === "right" ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <span
        className="relative h-10 w-10 shrink-0 overflow-hidden sm:h-14 sm:w-14"
        style={{ backgroundColor: accentWash(type.group) }}
      >
        <Image
          src={`/mbti_img/${type.image}`}
          alt={type.type}
          fill
          sizes="(max-width: 640px) 40px, 56px"
          className="object-contain object-bottom"
        />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-medium leading-none tracking-tight text-ink sm:text-lg">
          {type.type}
        </span>
        <span className="mt-1 block truncate text-[0.6875rem] tracking-tight text-ink-ghost sm:mt-1.5 sm:text-[0.75rem]">
          {type.cognitiveFunctions}
        </span>
      </span>
    </button>
  );
}

export function MBTIMatches({ type }: MBTIMatchesProps) {
  const setSelectedType = useMBTIStore((s) => s.setSelectedType);
  const accent = accentOf(type.group);

  // The four classic stack relations, plus pairs discussed on their own; the rest live on the pairing page.
  const relevant = mbtiMatches.filter(
    (match) => match.pair.includes(type.type) && (match.featured || relationOf(match.pair[0], match.pair[1]).core)
  );

  const partnerOf = (match: (typeof mbtiMatches)[0]) => {
    const partnerId = match.pair[0] === type.type ? match.pair[1] : match.pair[0];
    return mbtiTypes.find((t) => t.type === partnerId);
  };

  // Chips follow the pair's own order: the readings speak of pair[0] as ta and pair[1] as 你.
  const pairs = relevant.flatMap((match) => {
    const partner = partnerOf(match);
    if (!partner) return [];
    const [first, second] = match.pair[0] === type.type ? [type, partner] : [partner, type];
    return [{ partner, first, second, match, relation: relationOf(match.pair[0], match.pair[1]) }];
  });
  if (pairs.length === 0) return null;

  return (
    <Section
      label="Cognitive Partners"
      title="认知功能拍档"
      note="按功能栈的结构关系配对，而非印象。"
    >
      <div>
        {pairs.map(({ partner, first, second, match, relation }) => (
          <div
            key={partner.type}
            className="rule-t grid grid-cols-1 gap-4 py-4 sm:gap-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16"
          >
            {/* The pairing */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <TypeChip type={first} onClick={() => setSelectedType(first)} />

              <span
                className="hidden h-px flex-1 sm:block"
                style={{ backgroundColor: accent, opacity: 0.35 }}
              />

              <TypeChip type={second} align="right" onClick={() => setSelectedType(second)} />
            </div>

            {/* The reading */}
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className="text-[0.875rem] font-medium tracking-tight sm:text-[0.9375rem]"
                  style={{ color: accent }}
                >
                  {match.name}
                </span>
                <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{relation.name}</span>
              </div>
              {/* The stack reading speaks of pair[0] as ta — same convention as the description. */}
              <p className="mt-1.5 text-[0.75rem] leading-[1.7] text-ink-faint sm:mt-3 sm:text-[0.8125rem] sm:leading-[1.8]">
                {relation.reading}
              </p>
              <p className="mt-1 text-[0.8125rem] leading-[1.7] text-ink-soft sm:mt-1.5 sm:text-[0.9375rem] sm:leading-[1.8]">
                {match.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function MBTIOfficialMatches({ type }: MBTIMatchesProps) {
  const setSelectedType = useMBTIStore((s) => s.setSelectedType);

  return (
    <Section label="Official Matches" title="官方最佳拍档">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:gap-x-8 sm:gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        {type.bestPartners.map((code) => {
          const partner = mbtiTypes.find((t) => t.type === code);
          if (!partner) return null;

          return (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedType(partner)}
              className="rule-t flex items-center gap-3 py-2 text-left transition-opacity hover:opacity-60 sm:gap-4 sm:py-4"
            >
              <span
                className="relative h-10 w-10 shrink-0 overflow-hidden sm:h-14 sm:w-14"
                style={{ backgroundColor: accentWash(partner.group) }}
              >
                <Image
                  src={`/mbti_img/${partner.image}`}
                  alt={partner.type}
                  fill
                  sizes="(max-width: 640px) 40px, 56px"
                  className="object-contain object-bottom"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-medium leading-none tracking-tight text-ink sm:text-lg">
                  {partner.type}
                </span>
                <span className="mt-1 block truncate text-[0.75rem] text-ink-faint sm:mt-1.5 sm:text-[0.8125rem]">
                  {partner.title}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
