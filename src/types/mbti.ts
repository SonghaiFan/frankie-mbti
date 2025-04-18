export interface MBTIType {
  type: string;
  title: string;
  nickname: string;
  slogan: string;
  color: string;
  group: string;
  traits: string;
  image: string;
  strengths: string[];
  weaknesses: string[];
  surfaceTraits: string[];
  actualTraits: string[];
  bestPartners: string[];
  cognitiveFunctions: string;
}

export interface MBTIDimension {
  name: string;
  description: string;
  traits: string[];
}

export interface MBTIGroup {
  name: string;
  color: string;
  trait: string;
  keywords: string;
}

export interface MBTIMatch {
  pair: [string, string];
  name: string;
  matchType: "镜像对应" | "主导劣势" | "辅助第三";
  description: string;
}

export interface CognitiveFunction {
  readonly code: string;
  readonly name: string;
  readonly position: "主导" | "辅助" | "第三" | "劣势";
}

export type MBTIDimensionInfo = {
  name: string;
  description: string;
  traits: string[];
};

export interface MBTIGroupInfo {
  name: string;
  color: string;
  trait: string;
  keywords: string;
}

export interface ColorStyle {
  bg: string;
  border: string;
  text: string;
}

export interface Step {
  title: string;
  description: string;
  getResult: (mbti: MBTIType) => {
    result: string;
    explanation: string;
  };
}
