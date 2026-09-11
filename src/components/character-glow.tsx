"use client";

import { personalityColors, personalityGlows, PersonalityColor } from "@/styles/mbti-styles";
import { cn } from "@/lib/utils";

interface CharacterGlowProps {
  activeColor: PersonalityColor | string;
  className?: string;
}

/**
 * 巨大的柔焦光斑 (Giant Soft-Focus Glowing Light Blob)
 * Multi-layer diffuse light aura that fills the character's background.
 * Renders all 4 personality color layers (purple, green, blue, yellow)
 * and cross-fades them smoothly at 60fps via hardware-accelerated opacity.
 */
export function CharacterGlow({ activeColor, className }: CharacterGlowProps) {
  const normalizedColor =
    activeColor === "purple" || activeColor === "green" || activeColor === "blue" || activeColor === "yellow"
      ? (activeColor as PersonalityColor)
      : "purple";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]",
        className
      )}
      aria-hidden="true"
    >
      {personalityColors.map((colorKey) => {
        const glow = personalityGlows[colorKey];
        const isActive = normalizedColor === colorKey;

        return (
          <div
            key={colorKey}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isActive ? "opacity-100" : "opacity-0"
            )}
          >
            {/* 1. 超大柔焦弥散光斑 (Expansive Ambient Soft-Focus Bokeh Halo) */}
            <div
              className="transform-gpu absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[130%] sm:w-[170%] sm:h-[145%] lg:w-[190%] lg:h-[160%] rounded-full blur-3xl sm:blur-[72px] lg:blur-[110px] opacity-75"
              style={{
                background: `radial-gradient(ellipse at center, ${glow.ambient} 0%, ${glow.ambient} 32%, transparent 70%)`,
              }}
            />

            {/* 2. 鲜明柔焦主光斑 (Vibrant Soft-Focus Luminous Main Body) */}
            <div
              className="transform-gpu absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[105%] sm:w-[130%] sm:h-[115%] lg:w-[140%] lg:h-[125%] rounded-full blur-2xl sm:blur-3xl lg:blur-[64px] opacity-85"
              style={{
                background: `radial-gradient(ellipse at center, ${glow.core} 0%, ${glow.mid} 46%, transparent 74%)`,
              }}
            />

            {/* 3. 核心聚光柔焦光核 (Luminous Core Energy Center) */}
            <div
              className="transform-gpu absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[75%] sm:w-[90%] sm:h-[85%] lg:w-[95%] lg:h-[90%] rounded-full blur-xl sm:blur-2xl lg:blur-3xl opacity-90"
              style={{
                background: `radial-gradient(ellipse at center, ${glow.highlight} 0%, ${glow.core} 42%, transparent 72%)`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
