export interface MBTIType {
  type: string;
  title: string;
  nickname: string;
  slogan: string;
  color: string;
  group: string;
  group_des: string;
  image: string;
  strengths: string[];
  weaknesses: string[];
  surfaceTraits: string[];
  actualTraits: string[];
  bestPartners: string[];
  cognitiveFunctions: string;
  archetype?: string;
  coreParadox?: string;
  vividAnalogy?: string;
  energyModel?: string;
}

export type GroupCategory =
  | "temperament"
  | "interaction"
  | "lifestyle"
  | "worldview"
  | "archetype"
  | "orientation"
  | "fine";

export interface MBTIGroupDef {
  code: string;
  category: GroupCategory;
  name: string;
  keywords: string;
  description: string;
  /** Type codes in the group, derived from the letters in `code`. */
  types: string[];
  // Only the four temperaments carry these — they are what the groups view renders.
  nickname?: string;
  formula?: string;
  color?: string;
}

/** A temperament group with its UI fields guaranteed. */
export type ColorGroupData = MBTIGroupDef & Required<Pick<MBTIGroupDef, "nickname" | "formula" | "color">>;

/** One reading of a pair; every pair of types has one. How the stacks relate comes from `relationOf`. */
export interface MBTIMatch {
  pair: [string, string];
  name: string;
  /** 0–100, how easy the pair reads as a match. */
  score: number;
  /** Discussed on its own; shown in the type sheet even when the relation is not a core one. */
  featured?: boolean;
  description: string;
}

/** How two function stacks sit against each other, keyed by where pair[0]'s functions land in pair[1]'s eight slots. */
export interface PairRelation {
  signature: string;
  name: string;
  /** Relationship type in the graph. */
  rel: string;
  /** The four classic readings; these pairs appear in every type sheet. */
  core?: boolean;
  reading: string;
}
