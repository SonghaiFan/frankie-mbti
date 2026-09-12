"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import { cognitiveFunctions } from "@/data/core/mbti-data";
import { accentOf } from "@/styles/mbti-styles";
import { Section } from "./section";

interface MBTICognitiveFunctionsProps {
  type: MBTIType;
}

type FunctionEntry = {
  name: string;
  description: string;
  definition: string;
  characteristics: string;
  training: string;
  /** How the function shows when it sits in slots 1–2, and when it is pressed into slots 3–4. */
  atFront: string;
  atBottom: string;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

/** Thin chevron — the only icon in the section. */
function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="h-4 w-4 shrink-0 text-ink-faint"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}

/**
 * The energy model is written as "主导Ni… + 辅助Te… + 第三Fi… + 劣势Se…";
 * split it so each stack slot gets the author's reading of that function.
 */
function parseEnergyModel(model?: string): Record<string, string> {
  if (!model) return {};
  const out: Record<string, string> = {};
  for (const part of model.split(" + ")) {
    const m = part.match(/^(主导|辅助|第三|劣势)([A-Z][a-z])(.*)$/);
    if (m) out[m[2]] = m[3].trim();
  }
  return out;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{label}</dt>
      <dd className="mt-1 text-[0.8125rem] leading-[1.7] text-ink-soft sm:mt-2 sm:text-[0.875rem] sm:leading-[1.8]">{value}</dd>
    </div>
  );
}

export function MBTICognitiveFunctions({ type }: MBTICognitiveFunctionsProps) {
  const accent = accentOf(type.group);
  const stack = type.cognitiveFunctions.split(" ");
  const [open, setOpen] = useState<string | null>(null);
  const reading = parseEnergyModel(type.energyModel);

  const allFunctions: Record<string, FunctionEntry> = {
    ...cognitiveFunctions.categories.judging.functions,
    ...cognitiveFunctions.categories.perceiving.functions,
  };
  const opened = open ? allFunctions[open] : null;
  const openedSlot = open ? stack.indexOf(open) : -1;
  const frontOfStack = openedSlot >= 0 && openedSlot < 2;

  return (
    <Section
      label="Cognitive Functions"
      title="认知功能栈"
      note="MBTI 是性格的人设，认知功能是大脑的操作系统。点开任意一项看定义与发展建议。"
    >
      {/* The four slots: the author's reading of each function for this type. */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-8 sm:gap-y-8 lg:grid-cols-4">
        {stack.map((code, index) => {
          const level = cognitiveFunctions.levels[index];
          const func = allFunctions[code];
          const isOpen = open === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setOpen(isOpen ? null : code)}
              aria-expanded={isOpen}
              className={cn(
                "rule-t pt-2.5 text-left transition-opacity duration-300 sm:pt-5",
                open && !isOpen && "opacity-45"
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{level?.name}</span>
                <Chevron open={isOpen} />
              </div>
              <p
                className="mt-2 text-3xl font-medium leading-none tracking-tight sm:mt-4 sm:text-5xl"
                style={{ color: index === 0 ? accent : undefined }}
              >
                {code}
              </p>
              <p className="mt-1 text-[0.8125rem] text-ink sm:mt-3 sm:text-[0.9375rem]">{func?.name}</p>
              <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-soft sm:mt-2 sm:text-[0.8125rem] sm:leading-[1.7]">
                {reading[code] ?? level?.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* One panel under the grid, for whichever slot is open. */}
      <AnimatePresence initial={false} mode="wait">
        {open && opened && (
          <motion.div
            key={open}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="overflow-hidden"
          >
            <dl className="rule-t mt-4 grid grid-cols-1 gap-x-10 gap-y-3 pt-4 sm:mt-8 sm:grid-cols-2 sm:gap-y-6 sm:pt-8">
              <Detail label="定义" value={opened.definition} />
              <Detail label="特征" value={opened.characteristics} />
              <Detail label="发展建议" value={opened.training} />
              <Detail
                label={frontOfStack ? "主导时" : "劣势时"}
                value={frontOfStack ? opened.atFront : opened.atBottom}
              />
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
