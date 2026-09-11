"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { rise } from "@/styles/mbti-styles";

interface SectionProps {
  label: string;
  title: string;
  note?: string;
  children: ReactNode;
  className?: string;
  noteClassName?: string;
}

/** The one section shape used everywhere: eyebrow, title, hairline, content. */
export function Section({ label, title, note, children, className, noteClassName }: SectionProps) {
  return (
    <motion.section {...rise} className={cn(className)}>
      <header className="rule-b mb-4 flex flex-col gap-2 pb-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-12 sm:pb-6">
        <div className="min-w-0">
          <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">{label}</span>
          <h3 className="mt-1.5 text-xl font-medium leading-tight tracking-tight text-ink sm:mt-3 sm:text-[1.75rem]">
            {title}
          </h3>
        </div>
        {note && (
          <p
            className={cn(
              "max-w-[38ch] shrink-0 text-[0.75rem] leading-relaxed text-ink-ghost sm:text-[0.8125rem] sm:text-right",
              noteClassName
            )}
          >
            {note}
          </p>
        )}
      </header>
      {children}
    </motion.section>
  );
}

/** A label/value row separated by a hairline — the workhorse list item. */
export function RuleRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("rule-t py-2.5 sm:py-4", className)}>{children}</div>;
}
