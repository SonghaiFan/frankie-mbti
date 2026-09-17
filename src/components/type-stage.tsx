"use client";

import { useMemo, useSyncExternalStore } from "react";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { MorphFigure } from "@/components/morph-figure";
import { CharacterGlow } from "@/components/character-glow";
import { mbtiTypes, dimensions, cognitiveFunctions } from "@/data/core/mbti-data";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import { accentOf, groupCode } from "@/styles/mbti-styles";
import { useMBTIStore } from "@/store/mbti-store";

const easeSmoothOut = [0.22, 1, 0.36, 1] as const;
const knobSpring = { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.7 };

function useIsMobile() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const m = window.matchMedia("(max-width: 639px)");
      m.addEventListener("change", onStoreChange);
      return () => m.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(max-width: 639px)").matches,
    () => false
  );
}

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
    <div className={cn("rule-t pt-1 sm:pt-2 lg:pt-1.5 xl:pt-2.5", className)}>
      <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{label}</span>
      <div className="mt-0.5 sm:mt-1 lg:mt-0.5 xl:mt-1">{children}</div>
    </div>
  );
}

function Terms({ items, limit }: { items: string[]; limit?: number }) {
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <p className="line-clamp-2 min-h-0 text-[0.75rem] leading-[1.3] text-ink-soft sm:text-[0.8125rem] lg:leading-[1.35] xl:text-[0.875rem]">
      {shown.join(" · ")}
    </p>
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
  isMobile,
}: {
  dimension: (typeof dimensions)[number];
  letter: string;
  accent: string;
  onToggle: () => void;
  isMobile: boolean;
}) {
  const [left, right] = dimension.options;
  const atRight = right.type === letter;
  const active = atRight ? right : left;
  const other = atRight ? left : right;
  const trackW = isMobile ? 44 : 52;
  const trackH = isMobile ? 24 : 28;
  const knobPad = 2;
  const knobSize = trackH - knobPad * 2; // 20px on mobile, 24px on desktop
  const travel = trackW - knobSize - knobPad * 2; // 20px on mobile, 24px on desktop

  return (
    <div className="w-full">
      {/* The pole labels carry the meaning; on a phone the category name is
          the first thing that can go. */}
      <span className="hidden text-[0.625rem] tracking-[0.16em] text-ink-ghost sm:block lg:text-[0.6875rem]">
        {dimension.name}
      </span>

      <div className="mt-0.5 flex w-full items-center justify-between gap-1 sm:mt-1 sm:max-w-[21rem] sm:justify-start sm:gap-2 lg:gap-2 xl:gap-2.5">
        <span
          className={cn(
            "min-w-0 flex-1 text-right text-[0.6875rem] transition-colors duration-150 sm:text-[0.8125rem] xl:text-[0.875rem]",
            atRight ? "text-ink-ghost" : "text-ink"
          )}
        >
          {left.type} {left.name}
        </span>

        <span
          className="rams-lamp shrink-0"
          style={{ backgroundColor: atRight ? "#DCDCD8" : accent }}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={`${dimension.name}：当前 ${active.type} ${active.name}，切换为 ${other.type} ${other.name}`}
          className="rams-switch shrink-0 p-0.5 sm:px-1 sm:py-1 -my-0.5 touch-manipulation flex items-center justify-center"
        >
          <span
            className="rams-track relative flex h-6 w-11 sm:h-7 sm:w-[52px] items-center rounded-full"
            style={{ width: trackW, height: trackH }}
          >
            <motion.span
              animate={{ x: atRight ? travel : 0 }}
              transition={knobSpring}
              className="rams-knob absolute left-0.5 top-0.5 block h-5 w-5 sm:h-6 sm:w-6 rounded-full"
              style={{
                left: knobPad,
                top: knobPad,
                width: knobSize,
                height: knobSize,
              }}
            />
          </span>
        </button>

        <span
          className="rams-lamp shrink-0"
          style={{ backgroundColor: atRight ? accent : "#DCDCD8" }}
        />

        <span
          className={cn(
            "min-w-0 flex-1 text-[0.6875rem] transition-colors duration-150 sm:text-[0.8125rem] xl:text-[0.875rem]",
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
  const isMobile = useIsMobile();

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
        "mx-auto w-full max-w-[1560px] px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden",
        "h-full min-h-0 flex flex-col justify-center"
      )}
    >
      <div
        className={cn(
          "grid gap-2 sm:gap-3 py-1",
          "lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,20rem)]",
          "xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,21rem)]",
          "lg:grid-rows-[auto_1fr] lg:h-full lg:max-h-[760px] lg:items-start",
          "lg:gap-x-10 xl:gap-x-14 lg:gap-y-2 xl:gap-y-3 lg:py-2 xl:py-3"
        )}
      >
        {/* On a phone the hero header (Identity + Figure) and the switches sit together above the fold. */}
        <div className="flex flex-col gap-2 sm:gap-3 lg:contents">
          {/* Mobile top row: Identity on left, Character on right */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-3 lg:contents">
            {/* ── A · Identity ── */}
            <div className="flex h-32 min-w-0 flex-col justify-between sm:h-40 lg:h-auto lg:col-start-1 lg:row-start-1">
              <span className="eyebrow shrink-0 text-[0.625rem] sm:text-[0.6875rem]">16 种人格 · 更多可能</span>

              <div className="grid w-full flex-1 grid-cols-1">
                <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={type.type}
                  initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                  transition={{ duration: 0.15, ease: easeSmoothOut }}
                  className="col-start-1 row-start-1 w-full"
                >
                  <h1
                    className="display mt-0.5 leading-none text-ink lg:mt-1 xl:mt-2"
                    style={{ fontSize: "clamp(2rem, 5.2vh, 4.25rem)" }}
                  >
                    {type.type}
                  </h1>

                  <p className="mt-0.5 truncate text-base font-medium tracking-tight text-ink sm:text-2xl lg:text-xl xl:text-2xl lg:mt-0.5 xl:mt-1">
                    {type.title}
                  </p>
                  <p className="mt-0.5 truncate text-[0.6875rem] text-ink-soft sm:text-[0.8125rem] lg:text-[0.75rem] xl:text-[0.8125rem]">
                    {type.nickname}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 lg:mt-1 xl:mt-2">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    <span className="eyebrow truncate text-[0.625rem] sm:text-[0.6875rem]" style={{ color: accent }}>
                      {groupCode[type.group]} · {type.group}
                    </span>
                  </div>
                </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ── B · The figure. Also the way in. ── */}
            <div className="h-32 w-28 shrink-0 sm:h-40 sm:w-36 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full lg:w-full lg:min-h-0 lg:self-stretch flex flex-col justify-center">
              <div className="flex h-full flex-col justify-center">
                <button
                  type="button"
                  onClick={() => expandCard(type)}
                  aria-label={`查看 ${type.type} ${type.title} 的完整档案`}
                  className="group relative flex h-full w-full items-center justify-center lg:mx-auto lg:min-h-[180px] lg:max-h-[440px] lg:max-w-none lg:flex-1"
                >
                  <CharacterGlow activeColor={type.color} />

                  <MorphFigure
                    items={figures}
                    index={typeIndex}
                    transition="melt"
                    duration={0.9}
                    intensity={0.5}
                    aberration={0.22}
                    drift={0}
                    className="absolute inset-0 transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    fallback={
                      <Image
                        src={`/mbti_img/${type.image}`}
                        alt={type.type}
                        fill
                        sizes="(max-width: 640px) 120px, (max-width: 1024px) 200px, 40vw"
                        className="object-contain object-center"
                        priority
                      />
                    }
                  />

                  <span className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-[0.6875rem] text-ink-ghost opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 sm:text-[0.75rem]">
                    查看档案 →
                  </span>
                </button>

                <p className="mt-1.5 hidden shrink-0 text-center text-[0.75rem] italic leading-relaxed text-ink-faint lg:text-[0.8125rem] lg:block">
                  {type.slogan}
                </p>
              </div>
            </div>
          </div>

          {/* ── M · The control panel ── */}
          <div className="shrink-0 lg:col-start-3 lg:row-start-1">
            <div className="rule-t pt-1 sm:pt-2 lg:pt-1.5 xl:pt-2.5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">四维偏好 Preference</span>
                <span className="text-[0.625rem] text-ink-ghost sm:text-[0.6875rem]">拨动切换</span>
              </div>

              <div className="mt-0.5 grid grid-cols-2 gap-x-2 gap-y-0.5 sm:mt-2 sm:gap-x-6 sm:gap-y-1.5 lg:block lg:space-y-1 xl:space-y-2">
                {dimensions.map((dimension, i) => (
                  <PreferenceSwitch
                    key={dimension.name}
                    dimension={dimension}
                    letter={letters[i]}
                    accent={accent}
                    onToggle={() => flip(i)}
                    isMobile={isMobile}
                  />
                ))}
              </div>

              {/* Slogan on mobile shown below the 4 switches with stable height */}
              <p className="mt-1 flex min-h-[1.5em] items-center justify-center text-center text-[0.6875rem] italic leading-tight text-ink-faint sm:text-[0.75rem] lg:hidden">
                {type.slogan}
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom Area: Attributes & Relations (2-col on tablet md, separate grid cells on desktop lg) ── */}
        <div className="space-y-1.5 sm:space-y-2 md:grid md:grid-cols-2 md:items-start md:gap-x-8 md:space-y-0 lg:contents">
          {/* ── T · Attributes ── */}
          <div className="space-y-1 sm:space-y-1.5 lg:col-start-1 lg:row-start-2 lg:space-y-1 xl:space-y-2">
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
          <div className="space-y-1 sm:space-y-1.5 lg:col-start-3 lg:row-start-2 lg:space-y-1 xl:space-y-2">
            <Block label="契合类型 Compatible">
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 sm:gap-x-4">
                {type.bestPartners.map((partner) => (
                  <button
                    key={partner}
                    type="button"
                    onClick={() => setFeatured(partner)}
                    className="text-[0.75rem] text-ink-soft transition-colors duration-150 hover:text-ink sm:text-[0.8125rem] xl:text-[0.875rem]"
                  >
                    {partner}
                  </button>
                ))}
              </div>
              <p className="mt-0.5 text-[0.625rem] text-ink-ghost sm:text-[0.6875rem]">
                功能栈互补，容易谈到一块去。点一个即可切换。
              </p>
            </Block>

            <Block label="认知功能栈 Function Stack">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 sm:gap-y-1 lg:gap-y-0.5 xl:gap-y-1.5">
                {stack.map((fn, i) => (
                  <div key={fn}>
                    <dt className="text-[0.5625rem] tracking-[0.16em] text-ink-ghost sm:text-[0.625rem]">
                      {cognitiveFunctions.levels[i]?.name.split(" ")[0]} · {cognitiveFunctions.levels[i]?.cnRole}
                    </dt>
                    <dd
                      className="mt-0.5 text-base font-medium leading-none tracking-tight sm:text-lg lg:text-lg xl:text-xl"
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
      </div>
    </section>
  );
}
