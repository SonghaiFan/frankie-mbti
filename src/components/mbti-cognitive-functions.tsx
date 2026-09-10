"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";
import { cognitiveFunctions } from "@/data/mbti-data";
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
  details: string;
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-[0.875rem] leading-[1.8] text-ink-soft">{value}</dd>
    </div>
  );
}

export function MBTICognitiveFunctions({ type }: MBTICognitiveFunctionsProps) {
  const accent = accentOf(type.group);
  const stack = type.cognitiveFunctions.split(" ");
  const [openFunction, setOpenFunction] = useState<string | null>(null);
  const [showDeduction, setShowDeduction] = useState(false);

  const allFunctions: Record<string, FunctionEntry> = {
    ...cognitiveFunctions.categories.judging.functions,
    ...cognitiveFunctions.categories.perceiving.functions,
  };

  // 两步推断：E/I + J/P 定朝向，再由 T/F 或 S/N 定功能
  const deduce = () => {
    const [e, sn, tf, jp] = type.type.split("");
    const extrovert = e === "E";
    const judging = jp === "J";

    if (extrovert) {
      return judging
        ? {
            step1: "外向(E) + 判断(J) → 主导是外向的判断功能",
            step2: `判断功能优先，由 ${tf} 决定`,
            dominant: tf === "T" ? "Te" : "Fe",
          }
        : {
            step1: "外向(E) + 知觉(P) → 主导是外向的知觉功能",
            step2: `知觉功能优先，由 ${sn} 决定`,
            dominant: sn === "N" ? "Ne" : "Se",
          };
    }
    return judging
      ? {
          step1: "内向(I) + 判断(J) → 主导是内向的知觉功能",
          step2: `知觉功能优先，由 ${sn} 决定`,
          dominant: sn === "N" ? "Ni" : "Si",
        }
      : {
          step1: "内向(I) + 知觉(P) → 主导是内向的判断功能",
          step2: `判断功能优先，由 ${tf} 决定`,
          dominant: tf === "T" ? "Ti" : "Fi",
        };
  };

  const inference = deduce();

  const letterMeaning = (letter: string, index: number) =>
    [
      letter === "E" ? "外向人" : "内向人",
      letter === "N" ? "直觉型" : "感觉型",
      letter === "T" ? "思维型" : "情感型",
      letter === "J" ? "判断型" : "知觉型",
    ][index];

  const renderFunctionRow = (code: string, func: FunctionEntry) => {
    const rank = stack.indexOf(code);
    const isMine = rank !== -1;
    const isOpen = openFunction === code;
    const level = isMine ? cognitiveFunctions.levels[rank] : null;

    return (
      <div key={code} className={cn("rule-t", !isMine && "opacity-45")}>
        <button
          type="button"
          onClick={() => setOpenFunction(isOpen ? null : code)}
          aria-expanded={isOpen}
          className="group/row w-full py-5 text-left"
        >
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-4">
              <span
                className="text-2xl font-medium leading-none tracking-tight"
                style={{ color: isMine ? accent : undefined }}
              >
                {code}
              </span>
              <span className="text-[0.9375rem] text-ink">{func.name}</span>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              {level && (
                <span className="eyebrow hidden sm:inline">
                  {rank + 1} · {level.name.split(" ")[0]}
                </span>
              )}
              <Chevron open={isOpen} />
            </div>
          </div>

          <p className="mt-3 max-w-[54ch] text-[0.875rem] leading-relaxed text-ink-soft">
            {func.description}
          </p>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: easeOut }}
              className="overflow-hidden"
            >
              <dl className="grid grid-cols-1 gap-x-10 gap-y-6 pb-8 pt-2 sm:grid-cols-2">
                <Detail label="定义" value={func.definition} />
                <Detail label="特征" value={func.characteristics} />
                <Detail label="发展建议" value={func.training} />
                <Detail label="细节" value={func.details} />
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Section
      label="Cognitive Functions"
      title={cognitiveFunctions.description.title}
      note="点开任意一项，展开它的定义与发展建议。"
    >
      <p className="max-w-[62ch] text-base leading-[1.9] text-ink-soft">
        {cognitiveFunctions.description.content}
      </p>

      {/* ── Your stack ── */}
      <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
        {stack.map((code, index) => {
          const level = cognitiveFunctions.levels[index];
          const func = allFunctions[code];
          return (
            <div key={code} className="rule-t pt-5">
              <span className="eyebrow">{level?.name}</span>
              <p
                className="mt-4 text-4xl font-medium leading-none tracking-tight sm:text-5xl"
                style={{ color: index === 0 ? accent : undefined }}
              >
                {code}
              </p>
              <p className="mt-3 text-[0.9375rem] text-ink">{func?.name}</p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-ghost">
                {level?.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Two-step deduction ── */}
      <div className="mt-16 rule-t">
        <button
          type="button"
          onClick={() => setShowDeduction(!showDeduction)}
          aria-expanded={showDeduction}
          className="flex w-full items-center justify-between gap-6 py-6 text-left"
        >
          <div className="min-w-0">
            <h4 className="text-lg font-medium tracking-tight text-ink">
              主导功能两步推断法
            </h4>
            <p className="mt-1.5 text-[0.875rem] text-ink-faint">
              从字母代码 {type.type} 反推主导功能 {inference.dominant}
            </p>
          </div>
          <Chevron open={showDeduction} />
        </button>

        <AnimatePresence initial={false}>
          {showDeduction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="overflow-hidden"
            >
              <div className="pb-12">
                {/* Letters */}
                <div className="grid grid-cols-4 gap-x-6">
                  {type.type.split("").map((letter, index) => (
                    <div key={index} className="rule-t pt-5">
                      <p className="text-4xl font-medium leading-none tracking-tight text-ink sm:text-5xl">
                        {letter}
                      </p>
                      <p className="mt-3 text-[0.8125rem] text-ink-faint">
                        {letterMeaning(letter, index)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Steps */}
                <ol className="mt-12">
                  {[
                    { title: "看 E/I 与 J/P，确定主导功能的朝向", body: inference.step1 },
                    { title: "由判断 / 知觉偏好，锁定具体功能", body: inference.step2 },
                  ].map((step, index) => (
                    <li key={index} className="rule-t flex gap-6 py-6 sm:gap-10">
                      <span className="eyebrow shrink-0 pt-1">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.9375rem] font-medium text-ink">
                          {step.title}
                        </p>
                        <p className="mt-2 max-w-[54ch] text-[0.875rem] leading-[1.8] text-ink-soft">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Result */}
                <div className="rule-t flex flex-wrap items-baseline gap-x-6 gap-y-2 pt-8">
                  <span className="eyebrow">主导认知功能</span>
                  <span
                    className="text-4xl font-medium leading-none tracking-tight sm:text-5xl"
                    style={{ color: accent }}
                  >
                    {inference.dominant}
                  </span>
                  <span className="text-[0.9375rem] text-ink-soft">
                    {allFunctions[inference.dominant]?.name}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── All eight ── */}
      <div className="mt-20 grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-2">
        {[cognitiveFunctions.categories.judging, cognitiveFunctions.categories.perceiving].map(
          (category) => (
            <div key={category.title}>
              <h4 className="text-lg font-medium tracking-tight text-ink">
                {category.title}
              </h4>
              <p className="mt-2 max-w-[46ch] text-[0.875rem] leading-relaxed text-ink-faint">
                {category.description}
              </p>
              <div className="mt-8">
                {Object.entries(category.functions).map(([code, func]) =>
                  renderFunctionRow(code, func)
                )}
              </div>
            </div>
          )
        )}
      </div>
    </Section>
  );
}
