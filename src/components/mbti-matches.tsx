"use client";

import Image from "next/image";
import { MBTIType } from "@/types/mbti";
import { mbtiMatches, mbtiTypes } from "@/data/mbti-data";
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
      className={`group/chip flex min-w-0 items-center gap-3 text-left transition-opacity hover:opacity-60 ${
        align === "right" ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <span
        className="relative h-14 w-14 shrink-0 overflow-hidden"
        style={{ backgroundColor: accentWash(type.group) }}
      >
        <Image
          src={`/mbti_img/${type.image}`}
          alt={type.type}
          fill
          sizes="56px"
          className="object-contain object-bottom"
        />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-medium leading-none tracking-tight text-ink">
          {type.type}
        </span>
        <span className="mt-1.5 block truncate text-[0.75rem] tracking-tight text-ink-ghost">
          {type.cognitiveFunctions}
        </span>
      </span>
    </button>
  );
}

export function MBTIMatches({ type }: MBTIMatchesProps) {
  const setSelectedType = useMBTIStore((s) => s.setSelectedType);
  const accent = accentOf(type.group);

  const relevant = mbtiMatches.filter((match) => match.pair.includes(type.type));

  const partnerOf = (match: (typeof mbtiMatches)[0]) => {
    const partnerId = match.pair[0] === type.type ? match.pair[1] : match.pair[0];
    return mbtiTypes.find((t) => t.type === partnerId);
  };

  const combined = relevant.reduce((acc, match) => {
    const partner = partnerOf(match);
    if (!partner) return acc;
    const key = partner.type;
    if (!acc[key]) {
      acc[key] = { partner, matches: [], names: new Set<string>() };
    }
    acc[key].matches.push(match);
    acc[key].names.add(match.name);
    return acc;
  }, {} as Record<string, { partner: MBTIType; matches: typeof mbtiMatches; names: Set<string> }>);

  const pairs = Object.values(combined);
  if (pairs.length === 0) return null;

  return (
    <Section
      label="Cognitive Partners"
      title="认知功能拍档"
      note="按功能栈的结构关系配对，而非印象。"
    >
      <div>
        {pairs.map(({ partner, matches, names }) => (
          <div
            key={partner.type}
            className="rule-t grid grid-cols-1 gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16"
          >
            {/* The pairing */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <TypeChip type={type} onClick={() => setSelectedType(type)} />

              <span
                className="hidden h-px flex-1 sm:block"
                style={{ backgroundColor: accent, opacity: 0.35 }}
              />

              <TypeChip
                type={partner}
                align="right"
                onClick={() => setSelectedType(partner)}
              />
            </div>

            {/* The reading */}
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className="text-[0.9375rem] font-medium tracking-tight"
                  style={{ color: accent }}
                >
                  {Array.from(names).join(" · ")}
                </span>
                <span className="eyebrow">
                  {matches.map((m) => m.matchType).join(" / ")}
                </span>
              </div>
              <p className="mt-3 text-[0.9375rem] leading-[1.8] text-ink-soft">
                {matches.map((m) => m.description).join("；")}
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
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        {type.bestPartners.map((code) => {
          const partner = mbtiTypes.find((t) => t.type === code);
          if (!partner) return null;

          return (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedType(partner)}
              className="rule-t flex items-center gap-4 py-4 text-left transition-opacity hover:opacity-60"
            >
              <span
                className="relative h-14 w-14 shrink-0 overflow-hidden"
                style={{ backgroundColor: accentWash(partner.group) }}
              >
                <Image
                  src={`/mbti_img/${partner.image}`}
                  alt={partner.type}
                  fill
                  sizes="56px"
                  className="object-contain object-bottom"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-medium leading-none tracking-tight text-ink">
                  {partner.type}
                </span>
                <span className="mt-1.5 block truncate text-[0.8125rem] text-ink-faint">
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
