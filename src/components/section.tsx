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
}

/** The one section shape used everywhere: eyebrow, title, hairline, content. */
export function Section({ label, title, note, children, className }: SectionProps) {
  return (
    <motion.section {...rise} className={cn(className)}>
      <header className="rule-b mb-10 flex flex-col gap-4 pb-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
        <div className="min-w-0">
          <span className="eyebrow">{label}</span>
          <h3 className="mt-3 text-2xl font-medium leading-tight tracking-tight text-ink sm:text-[1.75rem]">
            {title}
          </h3>
        </div>
        {note && (
          <p className="max-w-[38ch] shrink-0 text-[0.8125rem] leading-relaxed text-ink-ghost sm:text-right">
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
  return <div className={cn("rule-t py-4", className)}>{children}</div>;
}
