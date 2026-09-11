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
      <dt className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{label}</dt>
      <dd className="mt-1 text-[0.8125rem] leading-[1.7] text-ink-soft sm:mt-2 sm:text-[0.875rem] sm:leading-[1.8]">{value}</dd>
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
          className="group/row w-full py-3 text-left sm:py-5"
        >
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3 sm:gap-4">
              <span
                className="text-xl font-medium leading-none tracking-tight sm:text-2xl"
                style={{ color: isMine ? accent : undefined }}
              >
                {code}
              </span>
              <span className="text-[0.875rem] text-ink sm:text-[0.9375rem]">{func.name}</span>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              {level && (
                <span className="eyebrow text-[0.625rem] hidden sm:inline sm:text-[0.6875rem]">
                  {rank + 1} · {level.name.split(" ")[0]}
                </span>
              )}
              <Chevron open={isOpen} />
            </div>
          </div>

          <p className="mt-1.5 max-w-[54ch] text-[0.8125rem] leading-relaxed text-ink-soft sm:mt-3 sm:text-[0.875rem]">
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
              <dl className="grid grid-cols-1 gap-x-10 gap-y-3 pb-4 pt-1 sm:grid-cols-2 sm:gap-y-6 sm:pb-8 sm:pt-2">
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
      <p className="max-w-[62ch] text-[0.875rem] leading-[1.7] text-ink-soft sm:text-base sm:leading-[1.9]">
        {cognitiveFunctions.description.content}
      </p>

      {/* ── Your stack ── */}
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:mt-14 sm:gap-x-8 sm:gap-y-8 lg:grid-cols-4">
        {stack.map((code, index) => {
          const level = cognitiveFunctions.levels[index];
          const func = allFunctions[code];
          return (
            <div key={code} className="rule-t pt-2.5 sm:pt-5">
              <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{level?.name}</span>
              <p
                className="mt-2 text-3xl font-medium leading-none tracking-tight sm:mt-4 sm:text-5xl"
                style={{ color: index === 0 ? accent : undefined }}
              >
                {code}
              </p>
              <p className="mt-1 text-[0.8125rem] text-ink sm:mt-3 sm:text-[0.9375rem]">{func?.name}</p>
              <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-ghost sm:mt-2 sm:text-[0.8125rem]">
                {level?.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Two-step deduction ── */}
      <div className="mt-8 rule-t sm:mt-16">
        <button
          type="button"
          onClick={() => setShowDeduction(!showDeduction)}
          aria-expanded={showDeduction}
          className="flex w-full items-center justify-between gap-4 py-3 text-left sm:gap-6 sm:py-6"
        >
          <div className="min-w-0">
            <h4 className="text-base font-medium tracking-tight text-ink sm:text-lg">
              主导功能两步推断法
            </h4>
            <p className="mt-1 text-[0.8125rem] text-ink-faint sm:mt-1.5 sm:text-[0.875rem]">
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
              <div className="pb-6 sm:pb-12">
                {/* Letters */}
                <div className="grid grid-cols-4 gap-x-3 sm:gap-x-6">
                  {type.type.split("").map((letter, index) => (
                    <div key={index} className="rule-t pt-2.5 sm:pt-5">
                      <p className="text-3xl font-medium leading-none tracking-tight text-ink sm:text-5xl">
                        {letter}
                      </p>
                      <p className="mt-1 text-[0.75rem] text-ink-faint sm:mt-3 sm:text-[0.8125rem]">
                        {letterMeaning(letter, index)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Steps */}
                <ol className="mt-6 sm:mt-12">
                  {[
                    { title: "看 E/I 与 J/P，确定主导功能的朝向", body: inference.step1 },
                    { title: "由判断 / 知觉偏好，锁定具体功能", body: inference.step2 },
                  ].map((step, index) => (
                    <li key={index} className="rule-t flex gap-4 py-3 sm:gap-10 sm:py-6">
                      <span className="eyebrow shrink-0 pt-0.5 sm:pt-1">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.875rem] font-medium text-ink sm:text-[0.9375rem]">
                          {step.title}
                        </p>
                        <p className="mt-1 max-w-[54ch] text-[0.8125rem] leading-[1.7] text-ink-soft sm:mt-2 sm:text-[0.875rem] sm:leading-[1.8]">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Result */}
                <div className="rule-t flex flex-wrap items-baseline gap-x-4 gap-y-1.5 pt-4 sm:gap-x-6 sm:gap-y-2 sm:pt-8">
                  <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">主导认知功能</span>
                  <span
                    className="text-3xl font-medium leading-none tracking-tight sm:text-5xl"
                    style={{ color: accent }}
                  >
                    {inference.dominant}
                  </span>
                  <span className="text-[0.875rem] text-ink-soft sm:text-[0.9375rem]">
                    {allFunctions[inference.dominant]?.name}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── All eight ── */}
      <div className="mt-8 grid grid-cols-1 gap-x-16 gap-y-8 sm:mt-20 sm:gap-y-16 lg:grid-cols-2">
        {[cognitiveFunctions.categories.judging, cognitiveFunctions.categories.perceiving].map(
          (category) => (
            <div key={category.title}>
              <h4 className="text-base font-medium tracking-tight text-ink sm:text-lg">
                {category.title}
              </h4>
              <p className="mt-1.5 max-w-[46ch] text-[0.8125rem] leading-relaxed text-ink-faint sm:mt-2 sm:text-[0.875rem]">
                {category.description}
              </p>
              <div className="mt-4 sm:mt-8">
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
