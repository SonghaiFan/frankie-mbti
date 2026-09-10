"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { MBTIType } from "@/types/mbti";
import { cn } from "@/lib/utils";

interface TypeCardProps {
  type: MBTIType;
  onOpen: () => void;
  /** Stagger for the scroll reveal, in seconds. */
  revealDelay?: number;
  className?: string;
}

/** Art, one hairline, a name. No container, no shadow. */
export function TypeCard({ type, onOpen, revealDelay = 0, className }: TypeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: revealDelay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group block w-full text-left", className)}
    >
      <div className="relative aspect-[5/6] w-full overflow-hidden">
        <Image
          src={`/mbti_img/${type.image}`}
          alt={type.type}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          className="object-contain object-bottom transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
      </div>

      <div className="card-rule flex items-baseline justify-between gap-3 pt-4">
        <span className="text-2xl font-medium leading-none tracking-tight text-ink sm:text-[1.75rem]">
          {type.type}
        </span>
        <span className="truncate text-[0.8125rem] text-ink-faint">{type.title}</span>
      </div>
    </motion.button>
  );
}
