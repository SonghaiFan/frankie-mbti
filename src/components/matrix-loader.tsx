"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

const CORNERS = [0, 3, 12, 15];
const RING = [1, 2, 7, 11, 14, 13, 8, 4];
const INNER = [5, 6, 9, 10];
const TWINKLE = [7, 2, 11, 5, 14, 9, 0, 12, 3, 15, 6, 10, 13, 1, 8, 4];

interface MatrixLoaderProps {
  variant?: "scan" | "pulse" | "orbit" | "twinkle";
  rounded?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  activeColor?: string;
}

export function MatrixLoader({
  variant = "scan",
  rounded = true,
  size = "md",
  className,
  activeColor,
}: MatrixLoaderProps) {
  const cycle = 1200;

  const dots = useMemo(() => {
    return Array.from({ length: 16 }, (_, idx) => {
      const isGap = rounded && CORNERS.includes(idx);
      if (isGap) return { isGap: true, delay: 0 };

      const col = idx % 4;
      let delay = 0;

      if (variant === "scan") {
        delay = Math.round(col * (cycle / 10));
      } else if (variant === "twinkle") {
        delay = Math.round(TWINKLE[idx] * (cycle / 16));
      } else if (variant === "orbit") {
        const k = RING.indexOf(idx);
        delay = k !== -1 ? Math.round(k * (cycle / 8)) : -1;
      } else if (variant === "pulse") {
        const isInner = INNER.includes(idx);
        delay = isInner ? 0 : Math.round(cycle * 0.16);
      }

      return { isGap: false, delay };
    });
  }, [variant, rounded, cycle]);

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className={cn(
        "t-matrix select-none shrink-0 inline-grid",
        size === "sm" && "t-matrix-sm",
        size === "lg" && "t-matrix-lg",
        className
      )}
      style={activeColor ? ({ "--matrix-active": activeColor } as React.CSSProperties) : undefined}
    >
      {dots.map((d, i) => (
        <i
          key={i}
          className={d.isGap ? "is-gap" : undefined}
          style={
            !d.isGap
              ? ({
                  "--d": d.delay >= 0 ? d.delay : 0,
                  animationPlayState: d.delay < 0 ? "paused" : "running",
                } as React.CSSProperties)
              : undefined
          }
        />
      ))}
    </div>
  );
}
