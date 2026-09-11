// ─────────────────────────────────────────────────────────────
// Design vocabulary.
// One stroke weight (hairline), one ink scale, four quiet accents.
// Nothing here draws a box. Structure comes from space and rules.
// ─────────────────────────────────────────────────────────────

export type GroupKey = "分析师" | "外交官" | "守护者" | "探险家";

export const groupAccent: Record<string, string> = {
  分析师: "#6B3FA0",
  外交官: "#2F7D52",
  守护者: "#2B56A8",
  探险家: "#B58121",
};

export const groupCode: Record<string, string> = {
  分析师: "NT",
  外交官: "NF",
  守护者: "SJ",
  探险家: "SP",
};

/** Accent for a group name, a quadrant code, or a legacy colour word. */
export const accentOf = (key?: string): string => {
  if (!key) return "#111111";
  const k = key.trim();
  if (groupAccent[k]) return groupAccent[k];
  const alias: Record<string, string> = {
    nt: groupAccent.分析师,
    purple: groupAccent.分析师,
    nf: groupAccent.外交官,
    green: groupAccent.外交官,
    sj: groupAccent.守护者,
    blue: groupAccent.守护者,
    sp: groupAccent.探险家,
    yellow: groupAccent.探险家,
  };
  return alias[k.toLowerCase()] ?? "#111111";
};

/** A 6%-alpha wash of the accent — the only fill allowed, and only behind art. */
export const accentWash = (key?: string) => `${accentOf(key)}0D`;

// ── Personality glow palettes for the giant soft-focus background ───────
export type PersonalityColor = "purple" | "green" | "blue" | "yellow";

export const personalityColors: PersonalityColor[] = ["purple", "green", "blue", "yellow"];

export interface PersonalityGlowConfig {
  id: PersonalityColor;
  groupKey: GroupKey;
  label: string;
  core: string;
  mid: string;
  ambient: string;
  highlight: string;
}

export const personalityGlows: Record<PersonalityColor, PersonalityGlowConfig> = {
  purple: {
    id: "purple",
    groupKey: "分析师",
    label: "紫色脑力派",
    core: "rgba(168, 85, 247, 0.42)",
    mid: "rgba(147, 51, 234, 0.28)",
    ambient: "rgba(192, 132, 252, 0.16)",
    highlight: "rgba(233, 213, 255, 0.38)",
  },
  green: {
    id: "green",
    groupKey: "外交官",
    label: "绿色理想派",
    core: "rgba(52, 211, 153, 0.45)",
    mid: "rgba(16, 185, 129, 0.30)",
    ambient: "rgba(110, 231, 183, 0.18)",
    highlight: "rgba(209, 250, 229, 0.38)",
  },
  blue: {
    id: "blue",
    groupKey: "守护者",
    label: "蓝色传统派",
    core: "rgba(96, 165, 250, 0.45)",
    mid: "rgba(37, 99, 235, 0.30)",
    ambient: "rgba(147, 197, 253, 0.18)",
    highlight: "rgba(219, 234, 254, 0.38)",
  },
  yellow: {
    id: "yellow",
    groupKey: "探险家",
    label: "黄色体验派",
    core: "rgba(251, 191, 36, 0.50)",
    mid: "rgba(245, 158, 11, 0.34)",
    ambient: "rgba(253, 224, 71, 0.22)",
    highlight: "rgba(254, 240, 138, 0.42)",
  },
};

export const glowOf = (colorOrGroup?: string): PersonalityGlowConfig => {
  if (!colorOrGroup) return personalityGlows.purple;
  const k = colorOrGroup.trim().toLowerCase();
  if (k === "purple" || k === "nt" || k === "分析师") return personalityGlows.purple;
  if (k === "green" || k === "nf" || k === "外交官") return personalityGlows.green;
  if (k === "blue" || k === "sj" || k === "守护者") return personalityGlows.blue;
  if (k === "yellow" || k === "sp" || k === "探险家") return personalityGlows.yellow;
  return personalityGlows.purple;
};

// ── Type scale ───────────────────────────────────────────────
export const t = {
  eyebrow: "eyebrow",
  display: "display text-ink",
  sectionTitle: "text-[1.75rem] sm:text-[2.25rem] font-medium tracking-tight leading-[1.1] text-ink",
  subhead: "text-lg sm:text-xl font-medium tracking-tight text-ink",
  body: "text-[0.9375rem] sm:text-base leading-[1.75] text-ink-soft",
  bodyTight: "text-sm leading-relaxed text-ink-soft",
  caption: "text-[0.8125rem] leading-relaxed text-ink-faint",
  mono: "font-mono text-[0.75rem] tracking-tight text-ink-faint",
} as const;

// ── Motion ───────────────────────────────────────────────────
export const rise = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export const spring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

/** Stagger helper — index-driven delay that never runs away. */
export const riseAt = (i: number, step = 0.05, cap = 0.4) => ({
  ...rise,
  transition: { ...rise.transition, delay: Math.min(i * step, cap) },
});
