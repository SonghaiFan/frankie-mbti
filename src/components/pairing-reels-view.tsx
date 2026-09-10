"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { mbtiTypes, mbtiMatches } from "@/data/mbti-data";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import { accentOf } from "@/styles/mbti-styles";
import { useMBTIStore } from "@/store/mbti-store";

const easeOut = [0.16, 1, 0.3, 1] as const;

const BAND = mbtiTypes.length; // 16
const REPEATS = 5; // runway either side of the band the reel rests in
const STRIP = Array.from({ length: REPEATS }, () => mbtiTypes).flat();
const HOME_BAND = 2; // the reel is folded back here after every stop

type Tier = { name: string; note: string };

const tierOf = (score: number): Tier => {
  if (score >= 90) return { name: "灵魂伴侣", note: "完美契合的理想配对" };
  if (score >= 70) return { name: "天作之合", note: "和谐稳定的默契搭档" };
  if (score >= 50) return { name: "有趣搭配", note: "充满惊喜的奇妙组合" };
  if (score >= 30) return { name: "互补成长", note: "在差异中共同学习进步" };
  return { name: "欢喜冤家", note: "极具挑战但有趣的张力关系" };
};

/**
 * One reel — a native scroll container with mandatory snapping, so a swipe
 * gets real momentum and the browser does the settling. After each stop the
 * position folds back to the middle band, which is invisible because the
 * strip repeats, and means the reel never reaches an end.
 */
function Reel({
  initialIndex,
  onSettle,
  onMoveChange,
  onOpen,
  accent,
  side,
}: {
  initialIndex: number;
  onSettle: (index: number) => void;
  onMoveChange: (moving: boolean) => void;
  onOpen: (type: MBTIType) => void;
  accent: string;
  side: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(initialIndex);
  const shownRef = useRef(initialIndex);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreNextScroll = useRef(false);

  const itemHeight = () =>
    ref.current?.querySelector<HTMLElement>("[data-reel-item]")?.offsetHeight ?? 0;

  const seek = (index: number) => {
    const el = ref.current;
    const h = itemHeight();
    if (!el || !h) return;
    ignoreNextScroll.current = true;
    el.scrollTop = (HOME_BAND * BAND + index) * h;
  };

  useLayoutEffect(() => {
    seek(initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex]);

  // The item height is breakpoint-dependent, so re-anchor after a resize.
  useEffect(() => {
    const onResize = () => seek(shownRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settle = () => {
    const el = ref.current;
    const h = itemHeight();
    if (!el || !h) return;

    const raw = Math.round(el.scrollTop / h);
    const index = ((raw % BAND) + BAND) % BAND;
    const home = HOME_BAND * BAND + index;

    if (raw !== home) {
      ignoreNextScroll.current = true;
      el.scrollTop = home * h;
    }

    shownRef.current = index;
    setShown(index);
    onMoveChange(false);
    onSettle(index);
  };

  const handleScroll = () => {
    if (ignoreNextScroll.current) {
      ignoreNextScroll.current = false;
      return;
    }
    onMoveChange(true);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(settle, 170);
  };

  const current = mbtiTypes[shown];

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div
        ref={ref}
        onScroll={handleScroll}
        tabIndex={0}
        role="listbox"
        aria-label={`${side}·上下滑动切换类型，当前 ${current.type}`}
        className={cn(
          "reel-scroll w-full snap-y snap-mandatory overflow-y-scroll",
          "h-[var(--win)]",
          "[mask-image:linear-gradient(to_bottom,transparent,black_var(--pad),black_calc(100%-var(--pad)),transparent)]"
        )}
      >
        <div className="py-[var(--pad)]">
          {STRIP.map((type, i) => (
            <div
              key={`${type.type}-${i}`}
              data-reel-item
              className="flex h-[var(--step)] w-full snap-center items-center justify-center"
            >
              <div className="relative h-[var(--art)] w-full">
                <Image
                  src={`/mbti_img/${type.image}`}
                  alt={type.type}
                  fill
                  sizes="(max-width: 640px) 45vw, 22vw"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The name only changes once the reel has stopped */}
      <div className="rule-t mt-4 w-full pt-4 text-center">
        <AnimatePresence mode="wait">
          <motion.button
            key={current.type}
            type="button"
            onClick={() => onOpen(current)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: easeOut }}
            className="block w-full transition-opacity hover:opacity-60"
          >
            <span
              className="block text-2xl font-medium leading-none tracking-tight sm:text-3xl"
              style={{ color: accent }}
            >
              {current.type}
            </span>
            <span className="mt-2 block truncate text-[0.8125rem] text-ink-faint">
              {current.title}
            </span>
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function PairingReelsView() {
  const featured = useMBTIStore((s) => s.featured);
  const expandCard = useMBTIStore((s) => s.expandCard);

  const startIndex = Math.max(
    0,
    mbtiTypes.findIndex((t) => t.type === featured)
  );

  const [leftIndex, setLeftIndex] = useState(startIndex);
  const [rightIndex, setRightIndex] = useState((startIndex + 7) % BAND);
  const [leftMoving, setLeftMoving] = useState(false);
  const [rightMoving, setRightMoving] = useState(false);

  const [pairs, setPairs] = useState<
    Array<{ type1: string; type2: string; label: string; score: number }> | null
  >(null);

  useEffect(() => {
    fetch("/mbti_pairing_labels_matrix_flat.json")
      .then((response) => response.json())
      .then(setPairs)
      .catch((error) => console.error("Error loading pairing data:", error));
  }, []);

  const left = mbtiTypes[leftIndex];
  const right = mbtiTypes[rightIndex];
  const accent = accentOf(left.group);

  const pair =
    pairs?.find((p) => p.type1 === left.type && p.type2 === right.type) ??
    pairs?.find((p) => p.type1 === right.type && p.type2 === left.type) ??
    null;

  const jung = mbtiMatches.find(
    (m) =>
      (m.pair[0] === left.type && m.pair[1] === right.type) ||
      (m.pair[0] === right.type && m.pair[1] === left.type)
  );

  const official =
    (left.bestPartners || []).includes(right.type) ||
    (right.bestPartners || []).includes(left.type);

  const tier = pair ? tierOf(pair.score) : null;
  const moving = leftMoving || rightMoving;

  return (
    <section className="flex flex-col lg:h-full lg:min-h-0">
      <header className="rule-b mb-12 shrink-0 pb-6 sm:mb-16 sm:pb-8 lg:mb-8 lg:pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <span className="eyebrow">Pairing</span>
            <h2
              className="display mt-4 text-ink lg:mt-3"
              style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.75rem)" }}
            >
              两个人放在一起
            </h2>
          </div>
          <p className="max-w-[42ch] text-[0.875rem] leading-[1.8] text-ink-soft lg:text-right">
            上下滑动左右两轮，看看功能栈怎么咬合。点名字可以看完整档案。
          </p>
        </div>
      </header>

      <div
        style={
          {
            // art = the figure box; gap = clear space to the next figure;
            // peek = how much of the neighbour shows past that gap.
            "--art": "clamp(7.5rem, 30vh, 15rem)",
            "--gap": "3.5rem",
            "--peek": "1rem",
            "--step": "calc(var(--art) + var(--gap))",
            "--win":
              "calc(var(--art) + var(--gap) * 2 + var(--peek) * 2)",
            "--pad": "calc((var(--gap) + var(--peek) * 2) / 2)",
          } as React.CSSProperties
        }
        className={cn(
          "grid grid-cols-2 gap-x-6 gap-y-14 sm:gap-x-12",
          "lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,1fr)]",
          "lg:items-center lg:gap-x-14 lg:gap-y-0"
        )}
      >
        <div className="col-start-1 row-start-1">
          <Reel
            initialIndex={startIndex}
            onMoveChange={setLeftMoving}
            onSettle={setLeftIndex}
            onOpen={expandCard}
            accent={accent}
            side="左侧"
          />
        </div>

        {/* Readout: between the two on a wide screen, below them otherwise */}
        <div
          className={cn(
            "col-span-2 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1",
            "transition-opacity duration-300",
            moving ? "opacity-25" : "opacity-100"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${left.type}-${right.type}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: easeOut }}
              className="mx-auto max-w-sm text-center"
            >
              <span className="eyebrow">契合度</span>
              <p
                className="mt-4 text-[4.5rem] font-medium leading-none tracking-tight tabular-nums"
                style={{ color: accent }}
              >
                {pair ? pair.score : "—"}
              </p>
              {tier && (
                <>
                  <p className="mt-4 text-[0.9375rem] text-ink">{tier.name}</p>
                  <p className="mt-1.5 text-[0.8125rem] text-ink-ghost">
                    {tier.note}
                  </p>
                </>
              )}

              <div className="rule-t mt-8 pt-7">
                <span className="eyebrow">配对关系</span>
                <p className="mt-4 text-3xl font-medium leading-none tracking-tight text-ink">
                  {pair ? pair.label : "—"}
                </p>
                <p className="mt-4 text-[0.8125rem] text-ink-ghost">
                  {left.type} × {right.type}
                  {official && " · 官方推荐理想配对"}
                </p>
              </div>

              <div className="rule-t mt-8 pt-7">
                <span className="eyebrow">
                  荣格配对{jung ? ` · ${jung.matchType}` : ""}
                </span>
                <p className="mt-4 text-[0.875rem] leading-[1.8] text-ink-soft">
                  {jung
                    ? jung.description
                    : "这一对没有直接的功能栈镜像关系——差异本身就是它的题目。"}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="col-start-2 row-start-1 lg:col-start-3">
          <Reel
            initialIndex={(startIndex + 7) % BAND}
            onMoveChange={setRightMoving}
            onSettle={setRightIndex}
            onOpen={expandCard}
            accent={accentOf(right.group)}
            side="右侧"
          />
        </div>
      </div>
    </section>
  );
}
