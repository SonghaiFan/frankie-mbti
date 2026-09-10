"use client";

import { useMemo } from "react";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { MorphFigure } from "@/components/morph-figure";
import { mbtiTypes, dimensions, cognitiveFunctions } from "@/data/mbti-data";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import { accentOf, groupCode } from "@/styles/mbti-styles";
import { useMBTIStore } from "@/store/mbti-store";

const easeOut = [0.16, 1, 0.3, 1] as const;
const knobSpring = { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.7 };

function Block({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rule-t pt-4 lg:pt-3.5", className)}>
      <span className="eyebrow">{label}</span>
      <div className="mt-3 lg:mt-2.5">{children}</div>
    </div>
  );
}

function Terms({ items, limit }: { items: string[]; limit?: number }) {
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <p className="text-[0.875rem] leading-[1.7] text-ink-soft">{shown.join(" · ")}</p>
  );
}

/**
 * A two-pole preference switch. Flipping it rewrites one letter of the code,
 * which is the whole navigation — there is no type list to scroll.
 * Label sides are fixed, so the knob's physical position always names the
 * choice; the accent dot rides on the knob as the single indicator.
 */
function PreferenceSwitch({
  dimension,
  letter,
  accent,
  onToggle,
}: {
  dimension: (typeof dimensions)[number];
  letter: string;
  accent: string;
  onToggle: () => void;
}) {
  const [left, right] = dimension.options;
  const atRight = right.type === letter;
  const active = atRight ? right : left;
  const other = atRight ? left : right;

  return (
    <div>
      <span className="block text-[0.6875rem] tracking-[0.16em] text-ink-ghost">
        {dimension.name}
      </span>

      <div className="mt-1.5 flex max-w-[21rem] items-center gap-3">
        <span
          className={cn(
            "flex-1 text-right text-[0.9375rem] transition-colors duration-300",
            atRight ? "text-ink-ghost" : "text-ink"
          )}
        >
          {left.type} {left.name}
        </span>

        <span
          className="rams-lamp"
          style={{ backgroundColor: atRight ? "#DCDCD8" : accent }}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={`${dimension.name}：当前 ${active.type} ${active.name}，切换为 ${other.type} ${other.name}`}
          className="rams-switch shrink-0 px-1 py-2.5"
        >
          <span className="rams-track relative block h-9 w-16 rounded-full">
            <motion.span
              animate={{ x: atRight ? 28 : 0 }}
              transition={knobSpring}
              style={{ top: "50%", marginTop: -14 }}
              className="rams-knob absolute left-1 block h-7 w-7 rounded-full"
            />
          </span>
        </button>

        <span
          className="rams-lamp"
          style={{ backgroundColor: atRight ? accent : "#DCDCD8" }}
        />

        <span
          className={cn(
            "flex-1 text-[0.9375rem] transition-colors duration-300",
            atRight ? "text-ink" : "text-ink-ghost"
          )}
        >
          {right.type} {right.name}
        </span>
      </div>
    </div>
  );
}

export function TypeStage() {
  const code = useMBTIStore((s) => s.featured);
  const setFeatured = useMBTIStore((s) => s.setFeatured);
  const expandCard = useMBTIStore((s) => s.expandCard);

  const typeIndex = Math.max(
    0,
    mbtiTypes.findIndex((t) => t.type === code)
  );
  const type: MBTIType = mbtiTypes[typeIndex];
  const letters = type.type.split("");

  // Stable for the life of the page — the morph engine keys its textures off it.
  const figures = useMemo(
    () => mbtiTypes.map((t) => ({ src: `/mbti_img/${t.image}`, alt: t.type })),
    []
  );
  const accent = accentOf(type.group);
  const stack = type.cognitiveFunctions.split(" ");

  const flip = (index: number) => {
    const [a, b] = dimensions[index].options;
    const next = [...letters];
    next[index] = letters[index] === a.type ? b.type : a.type;
    setFeatured(next.join(""));
  };

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[1560px] px-6 sm:px-10 lg:px-16",
        "lg:flex lg:min-h-full lg:flex-col lg:justify-center"
      )}
    >
      <div
        className={cn(
          "grid gap-10 py-10 sm:gap-14 sm:py-14",
          "lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,21rem)]",
          "lg:grid-rows-[auto_1fr] lg:min-h-0 lg:items-start",
          "lg:gap-x-16 lg:gap-y-5 lg:py-4"
        )}
      >
        {/* ── A · Identity ── */}
        <div className="lg:col-start-1 lg:row-start-1">
          <span className="eyebrow">16 种人格 · 更多可能</span>

          <AnimatePresence mode="wait">
            <motion.div
              key={type.type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <h1
                className="display mt-6 text-ink lg:mt-4"
                style={{ fontSize: "clamp(3rem, 11vw, 5.75rem)" }}
              >
                {type.type}
              </h1>

              <p className="mt-4 text-2xl font-medium tracking-tight text-ink sm:text-3xl lg:mt-3">
                {type.title}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-[1.8] text-ink-soft">
                {type.traits}
              </p>
              <div className="mt-5 flex items-center gap-2.5 lg:mt-4">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span className="eyebrow" style={{ color: accent }}>
                  {groupCode[type.group]} · {type.group}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── B · The figure. Also the way in. ── */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0 lg:self-stretch">
          <div className="flex h-full flex-col">
            <button
              type="button"
              onClick={() => expandCard(type)}
              aria-label={`查看 ${type.type} ${type.title} 的完整档案`}
              className="group relative mx-auto flex aspect-[4/5] w-full max-w-[22rem] items-center justify-center sm:max-w-[26rem] lg:aspect-auto lg:min-h-0 lg:max-w-none lg:flex-1"
              style={{
                background: `radial-gradient(58% 52% at 50% 52%, ${accent}1F 0%, ${accent}0A 45%, transparent 72%)`,
              }}
            >
              <MorphFigure
                items={figures}
                index={typeIndex}
                transition="melt"
                duration={0.9}
                intensity={0.5}
                aberration={0.22}
                drift={0.25}
                className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                fallback={
                  <Image
                    src={`/mbti_img/${type.image}`}
                    alt={type.type}
                    fill
                    sizes="(max-width: 1024px) 90vw, 45vw"
                    className="object-contain object-center"
                    priority
                  />
                }
              />

              <span className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-[0.8125rem] text-ink-ghost opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                查看完整档案 →
              </span>
            </button>

            <p className="mt-5 text-center text-[0.875rem] italic leading-relaxed text-ink-faint">
              {type.slogan}
            </p>
          </div>
        </div>

        {/* ── M · The control panel ── */}
        <div className="lg:col-start-3 lg:row-start-1">
          <div className="rule-t pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="eyebrow">四维偏好 Preference</span>
              <span className="text-[0.75rem] text-ink-ghost">拨动切换</span>
            </div>

            <div className="mt-4 space-y-3">
              {dimensions.map((dimension, i) => (
                <PreferenceSwitch
                  key={dimension.name}
                  dimension={dimension}
                  letter={letters[i]}
                  accent={accent}
                  onToggle={() => flip(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── T · Attributes ── */}
        <div className="space-y-7 lg:col-start-1 lg:row-start-2 lg:space-y-4">
          <Block label="关键特征 Key Traits">
            <Terms items={type.actualTraits} limit={4} />
          </Block>
          <Block label="优势 Strengths">
            <Terms items={type.strengths} limit={3} />
          </Block>
          <Block label="盲点 Blind Spots">
            <Terms items={type.weaknesses} limit={3} />
          </Block>
        </div>

        {/* ── R · Relations & stack ── */}
        <div className="space-y-7 lg:col-start-3 lg:row-start-2 lg:space-y-4">
          <Block label="契合类型 Compatible">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {type.bestPartners.map((partner) => (
                <button
                  key={partner}
                  type="button"
                  onClick={() => setFeatured(partner)}
                  className="text-[0.9375rem] text-ink-soft transition-colors hover:text-ink"
                >
                  {partner}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[0.8125rem] text-ink-ghost">
              功能栈互补，容易谈到一块去。点一个即可切换。
            </p>
          </Block>

          <Block label="认知功能栈 Function Stack">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {stack.map((fn, i) => (
                <div key={fn}>
                  <dt className="text-[0.6875rem] tracking-[0.16em] text-ink-ghost">
                    {cognitiveFunctions.levels[i]?.name.split(" ")[0]}
                  </dt>
                  <dd
                    className="mt-1 text-2xl font-medium leading-none tracking-tight"
                    style={{ color: i === 0 ? accent : undefined }}
                  >
                    {fn}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>
        </div>
      </div>
    </section>
  );
}
