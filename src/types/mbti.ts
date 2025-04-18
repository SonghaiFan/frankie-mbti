export type MBTIType = {
  type: string;
  title: string;
  nickname: string;
  motto: string;
  color: "purple" | "green" | "blue" | "yellow";
  group: "分析师" | "外交官" | "守护者" | "探险家";
  traits: string;
  image: string;
};

export type MBTIDimension = {
  name: string;
  description: string;
  traits: string[];
};

export type MBTIGroup = {
  name: string;
  color: string;
  trait: string;
  keywords: string;
};

export type CognitiveFunction = {
  name: string;
  description: string;
};

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
