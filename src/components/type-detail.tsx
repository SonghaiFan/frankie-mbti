"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";
import Portal from "./portal";
import { MBTIType } from "@/types/mbti";
import { accentOf, groupCode } from "@/styles/mbti-styles";
import { useMBTIStore } from "@/store/mbti-store";
import { CharacterGlow } from "./character-glow";
import { MBTIIntroduction } from "./mbti-introduction";
import { MBTIDimensions } from "./mbti-dimensions";
import { MBTICognitiveFunctions } from "./mbti-cognitive-functions";
import { MBTIMatches } from "./mbti-matches";

const easeOut = [0.16, 1, 0.3, 1] as const;

const setBodyScroll = (enabled: boolean) => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = enabled ? "" : "hidden";
  }
};

function Sheet({ type, onClose }: { type: MBTIType; onClose: () => void }) {
  const accent = accentOf(type.group);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[190] bg-ink/15 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.99 }}
        transition={{ duration: 0.45, ease: easeOut }}
        role="dialog"
        aria-modal
        aria-label={`${type.type} ${type.title}`}
        className="fixed left-1/2 top-1/2 z-[200] w-[96vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-paper shadow-[0_40px_120px_-48px_rgba(0,0,0,0.35)] sm:w-[94vw]"
      >
        <div className="flex max-h-[94dvh] flex-col sm:max-h-[92vh]">
          <button
            onClick={onClose}
            type="button"
            aria-label="关闭"
            className="absolute right-2.5 top-2.5 z-[100] flex h-8 w-8 items-center justify-center text-ink-faint transition-colors hover:text-ink sm:right-5 sm:top-5 sm:h-10 sm:w-10"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeWidth="1"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Masthead */}
          <div className="rule-b relative flex shrink-0 flex-row items-stretch overflow-hidden">
            <div className="relative w-20 shrink-0 sm:h-auto sm:min-h-[220px] sm:w-[34%] sm:max-w-[280px]">
              <CharacterGlow activeColor={type.color} />
              <Image
                src={`/mbti_img/${type.image}`}
                alt={type.type}
                fill
                sizes="(max-width: 640px) 80px, 300px"
                className="relative z-10 object-contain object-bottom"
              />
            </div>

            <div className="relative z-10 flex flex-1 flex-col justify-between gap-4 p-3 pr-10 sm:gap-8 sm:p-10">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]" style={{ color: accent }}>
                    {groupCode[type.group]} · {type.group}
                  </span>
                </div>

                <h2
                  className="display mt-1 text-ink sm:mt-5"
                  style={{ fontSize: "clamp(1.75rem, 6vw, 4.5rem)" }}
                >
                  {type.type}
                </h2>
                <p className="mt-0.5 text-[0.8125rem] text-ink-soft sm:mt-3 sm:text-lg">
                  {type.title} · {type.nickname}
                </p>
              </div>

              {/* On a phone these move into the scrolling body — the masthead
                  has to stay a header, not eat the sheet. */}
              <dl className="hidden gap-x-10 gap-y-5 sm:grid sm:grid-cols-2">
                <div>
                  <dt className="eyebrow">特征</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink">
                    {type.traits}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">宣告</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink">
                    {type.slogan}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Body */}
          <div className="scroll-quiet flex-1 overflow-y-auto bg-paper px-4 py-6 sm:px-10 sm:py-16">
            <div className="space-y-8 sm:space-y-28">
              <dl className="grid grid-cols-1 gap-3 sm:hidden">
                <div>
                  <dt className="eyebrow text-[0.625rem]">特征</dt>
                  <dd className="mt-1 text-[0.8125rem] leading-relaxed text-ink">
                    {type.traits}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-[0.625rem]">宣告</dt>
                  <dd className="mt-1 text-[0.8125rem] leading-relaxed text-ink">
                    {type.slogan}
                  </dd>
                </div>
              </dl>

              <MBTIIntroduction type={type} />
              <MBTIDimensions type={type} />
              <MBTICognitiveFunctions type={type} />
              <MBTIMatches type={type} />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/**
 * The one detail surface for the whole site. Mounted once at page level and
 * driven by the store, so nothing can hide it behind an animated ancestor.
 */
export function TypeDetail() {
  const selectedType = useMBTIStore((s) => s.selectedType);
  const collapseCard = useMBTIStore((s) => s.collapseCard);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") collapseCard();
    }
    if (selectedType) {
      setBodyScroll(false);
      document.addEventListener("keydown", onKeyDown);
    } else {
      setBodyScroll(true);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      setBodyScroll(true);
    };
  }, [selectedType, collapseCard]);

  return (
    <Portal>
      <AnimatePresence>
        {selectedType && (
          <Sheet
            key={selectedType.type}
            type={selectedType}
            onClose={collapseCard}
          />
        )}
      </AnimatePresence>
    </Portal>
  );
}
