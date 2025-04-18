"use client";

import { motion } from "framer-motion";
import { MBTIType } from "@/types/mbti";
import {
  mbtiCard,
  mbtiCardHeader,
  mbtiCardTitle,
  mbtiCardContent,
  mbtiCardDescription,
  getMbtiColor,
  mbtiMotionStyles,
} from "@/styles/mbti-styles";
import { cn } from "@/lib/utils";
import { cognitiveFunctions } from "@/data/mbti-data";
import { calculateCognitiveFunctions } from "@/utils/mbti";

type CognitiveFunctionName = keyof typeof cognitiveFunctions.types;

interface Step {
  title: string;
  description: string;
  getResult: (mbti: string) => {
    result: string;
    explanation: string;
  };
}

const steps: Step[] = [
  {
    title: "第一步：确定主导功能的内外向",
    description: "看第一个字母 E/I",
    getResult: (mbti) => {
      const att = mbti[0];
      const isI = att === "I";
      return {
        result: `${att}（${isI ? "内向" : "外向"}）`,
        explanation: isI
          ? `因为你是 I（Introvert），所以主导功能必须是内向功能（Fi、Ti、Ni、Si）。\n❌ 排除：Ne、Se、Te、Fe → 它们都是外向功能，不可能是主导。`
          : `因为你是 E（Extravert），所以主导功能必须是外向功能（Ne、Se、Te、Fe）。\n❌ 排除：Fi、Ti、Ni、Si → 它们都是内向功能，不可能是主导。`,
      };
    },
  },
  {
    title: "第二步：确定外向功能是判断还是感知",
    description: "看第四个字母 J/P",
    getResult: (mbti) => {
      const [att, , , li] = mbti;
      const isI = att === "I";
      const isP = li === "P";
      const remainingFuncs = isI
        ? ["Fi", "Ti", "Ni", "Si"]
        : ["Ne", "Se", "Te", "Fe"];
      return {
        result: `${li}（${isP ? "感知" : "判断"}）`,
        explanation: isI
          ? isP
            ? `你是 P 型，而且是 I → 所以外向功能是感知功能，只能是 Ne 或 Se。\n❌ 排除：Fe、Te → 它们是判断功能，不可能是你的辅助功能。`
            : `你是 J 型，而且是 I → 所以外向功能是判断功能，只能是 Fe 或 Te。\n❌ 排除：Ne、Se → 它们是感知功能，不可能是你的辅助功能。`
          : isP
          ? `你是 P 型，而且是 E → 所以主导功能是感知功能，只能是 Ne 或 Se。\n❌ 排除：Te、Fe → 它们是判断功能，不可能是你的主导功能。`
          : `你是 J 型，而且是 E → 所以主导功能是判断功能，只能是 Fe 或 Te。\n❌ 排除：Ne、Se → 它们是感知功能，不可能是你的主导功能。`,
      };
    },
  },
  {
    title: "第三步：确定感知和判断的偏好",
    description: "看第二字母 S/N 和第三字母 T/F",
    getResult: (mbti) => {
      const [att, pe, ju, li] = mbti;
      const isI = att === "I";
      const isP = li === "P";
      const candidates = isI
        ? isP
          ? ["Ne", "Se"] // I + P: 外向感知
          : ["Te", "Fe"] // I + J: 外向判断
        : isP
        ? ["Ne", "Se"] // E + P: 外向感知
        : ["Te", "Fe"]; // E + J: 外向判断

      return {
        result: `${pe}（${pe === "S" ? "实感" : "直觉"}），${ju}（${
          ju === "T" ? "思维" : "情感"
        }）`,
        explanation: `感知偏好是 ${pe}，判断偏好是 ${ju}\n❌ 排除：${candidates.find(
          (c) =>
            (pe === "S" && c.includes("N")) ||
            (pe === "N" && c.includes("S")) ||
            (ju === "T" && c.includes("F")) ||
            (ju === "F" && c.includes("T"))
        )} → 不符合你的偏好`,
      };
    },
  },
  {
    title: "第四步：确定主导功能",
    description: "综合前三步的结论",
    getResult: (mbti) => {
      const [att, pe, ju, li] = mbti;
      const isI = att === "I";
      const isJext = (li === "J") === !isI;
      const domOri = isI ? "i" : "e";
      const dom = isJext
        ? ju === "T"
          ? `T${domOri}`
          : `F${domOri}`
        : pe === "S"
        ? `S${domOri}`
        : `N${domOri}`;

      return {
        result: dom,
        explanation: `根据前三步，你的主导功能是 ${dom}（${
          dom[0] === "T"
            ? "内在逻辑分析"
            : dom[0] === "F"
            ? "价值观判断"
            : dom[0] === "S"
            ? "具体感知体验"
            : "抽象概念联想"
        }）`,
      };
    },
  },
  {
    title: "第五步：确定辅助功能",
    description: "主导的反方向 + 另一种功能",
    getResult: (mbti) => {
      const [att, pe, ju, li] = mbti;
      const isI = att === "I";
      const isJext = (li === "J") === !isI;
      const auxOri = isI ? "e" : "i";
      const aux = isJext
        ? pe === "S"
          ? `S${auxOri}`
          : `N${auxOri}`
        : ju === "T"
        ? `T${auxOri}`
        : `F${auxOri}`;

      return {
        result: aux,
        explanation: `辅助功能必须是${auxOri === "e" ? "外" : "内"}向的${
          isJext ? "感知" : "判断"
        }功能，所以是 ${aux}（${
          aux[0] === "T"
            ? "逻辑分析"
            : aux[0] === "F"
            ? "价值判断"
            : aux[0] === "S"
            ? "实际体验"
            : "概念联想"
        }）`,
      };
    },
  },
  {
    title: "第六步：确定第三功能",
    description: "辅助功能的镜像",
    getResult: (mbti) => {
      const [att, pe, ju, li] = mbti;
      const isI = att === "I";
      const isJext = (li === "J") === !isI;
      const auxOri = isI ? "e" : "i";
      const aux = isJext
        ? pe === "S"
          ? `S${auxOri}`
          : `N${auxOri}`
        : ju === "T"
        ? `T${auxOri}`
        : `F${auxOri}`;
      const third = aux[0] + (aux[1] === "e" ? "i" : "e");

      return {
        result: third,
        explanation: `${third} 是 ${aux} 的${
          third[1] === "i" ? "内" : "外"
        }向镜像，对应你的第三功能（${
          third[0] === "T"
            ? "不成熟的逻辑分析"
            : third[0] === "F"
            ? "不成熟的价值判断"
            : third[0] === "S"
            ? "不成熟的实际体验"
            : "不成熟的概念联想"
        }）`,
      };
    },
  },
  {
    title: "第七步：确定劣势功能",
    description: "主导功能的镜像",
    getResult: (mbti) => {
      const [att, pe, ju, li] = mbti;
      const isI = att === "I";
      const isJext = (li === "J") === !isI;
      const domOri = isI ? "i" : "e";
      const dom = isJext
        ? ju === "T"
          ? `T${domOri}`
          : `F${domOri}`
        : pe === "S"
        ? `S${domOri}`
        : `N${domOri}`;
      const fourth = dom[0] + (dom[1] === "e" ? "i" : "e");

      return {
        result: fourth,
        explanation: `${fourth} 是 ${dom} 的镜像，是你最不擅长的功能（${
          fourth[0] === "T"
            ? "逻辑分析"
            : fourth[0] === "F"
            ? "价值判断"
            : fourth[0] === "S"
            ? "实际体验"
            : "概念联想"
        }）`,
      };
    },
  },
];

interface MBTICognitiveFunctionsProps {
  type: MBTIType;
}

export function MBTICognitiveFunctions({ type }: MBTICognitiveFunctionsProps) {
  const colorStyle = getMbtiColor(type.group);
  const { dom, aux, third, fourth } = calculateCognitiveFunctions(type);

  return (
    <motion.div
      {...mbtiMotionStyles}
      className={cn(mbtiCard, colorStyle.border)}
    >
      <motion.div
        {...mbtiMotionStyles}
        className={cn(mbtiCardHeader, colorStyle.bg)}
      >
        <motion.h3
          {...mbtiMotionStyles}
          className={cn(mbtiCardTitle, colorStyle.text)}
        >
          认知功能推导过程
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className={mbtiCardContent}>
        {steps.map((step, index) => {
          const stepResult = step.getResult(type.type);
          return (
            <motion.div
              key={step.title}
              {...mbtiMotionStyles}
              className="mb-8 last:mb-0"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-sm",
                    colorStyle.bg
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <motion.h4
                    {...mbtiMotionStyles}
                    className={cn(mbtiCardTitle, colorStyle.text, "text-base")}
                  >
                    {step.title}
                  </motion.h4>
                  <motion.p
                    {...mbtiMotionStyles}
                    className={cn(mbtiCardDescription, "text-sm")}
                  >
                    {step.description}
                  </motion.p>
                  <motion.div
                    {...mbtiMotionStyles}
                    className={cn(
                      "rounded-lg p-3 font-medium text-sm",
                      colorStyle.bg,
                      colorStyle.text
                    )}
                  >
                    {stepResult.result}
                  </motion.div>
                  <motion.div
                    {...mbtiMotionStyles}
                    className={cn(
                      "rounded-lg p-3 whitespace-pre-line text-sm",
                      "bg-gray-50 dark:bg-gray-700",
                      "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {stepResult.explanation}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        {...mbtiMotionStyles}
        className={cn(mbtiCardHeader, colorStyle.bg)}
      >
        <motion.h3
          {...mbtiMotionStyles}
          className={cn(mbtiCardTitle, colorStyle.text)}
        >
          最终认知功能栈
        </motion.h3>
      </motion.div>

      <motion.div {...mbtiMotionStyles} className="p-6 space-y-4">
        {[
          { func: dom, level: cognitiveFunctions.levels[0] },
          { func: aux, level: cognitiveFunctions.levels[1] },
          { func: third, level: cognitiveFunctions.levels[2] },
          { func: fourth, level: cognitiveFunctions.levels[3] },
        ].map(({ func, level }, index) => {
          const funcType =
            cognitiveFunctions.types[func.name as CognitiveFunctionName];
          return (
            <motion.div
              key={func.name}
              {...mbtiMotionStyles}
              className={cn(
                "relative flex gap-4 items-start p-4 rounded-xl transition-all duration-200",
                "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                "group"
              )}
            >
              {/* Level Indicator */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-200",
                  colorStyle.bg,
                  "opacity-20 group-hover:opacity-100"
                )}
              />

              {/* Icon and Main Content */}
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl shadow-sm flex items-center justify-center text-2xl",
                  "bg-white dark:bg-gray-800"
                )}
              >
                {funcType.icon}
              </div>

              <div className="flex-1 space-y-2">
                {/* Title Row */}
                <div className="flex items-center gap-2">
                  <span className="text-xl">{level.icon}</span>
                  <h4 className={cn("font-semibold", colorStyle.text)}>
                    {level.name}
                  </h4>
                </div>

                {/* Function Type Info */}
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md font-mono font-medium",
                      colorStyle.bg,
                      colorStyle.text,
                      "bg-opacity-10 dark:bg-opacity-20"
                    )}
                  >
                    {func.name}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {funcType.name}
                  </span>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {funcType.description}
                    </p>
                    <div className="h-px bg-gray-100 dark:bg-gray-800" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {level.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stack Level Indicator */}
              <div
                className={cn(
                  "flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium",
                  colorStyle.bg,
                  colorStyle.text,
                  "bg-opacity-10 dark:bg-opacity-20"
                )}
              >
                {`#${index + 1}`}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
