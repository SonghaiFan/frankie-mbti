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

type CognitiveFunctionName = keyof typeof cognitiveFunctions.types;

interface Step {
  title: string;
  description: string;
  getResult: (mbti: string) => {
    result: string;
    explanation: string;
  };
}

interface StepResult {
  result: string;
  explanation: string;
  remaining: string[];
  excluded: string[];
}

const allFunctions = ["Fi", "Ti", "Ni", "Si", "Ne", "Se", "Te", "Fe"] as const;

const getStepResult = (
  mbti: string,
  step: number,
  previousRemaining?: string[]
): StepResult => {
  const [att, pe, ju, li] = mbti;
  const isI = att === "I";
  const isP = li === "P";
  const isJext = (li === "J") === !isI;

  let remaining =
    step === 0 ? [...allFunctions] : [...(previousRemaining || [])];
  let excluded: string[] = [];

  switch (step) {
    case 0: {
      // 第一步：根据 E/I 排除
      excluded = isI ? ["Ne", "Se", "Te", "Fe"] : ["Fi", "Ti", "Ni", "Si"];
      remaining = remaining.filter((f) => !excluded.includes(f));
      return {
        result: `${att}（${isI ? "内向" : "外向"}）`,
        explanation: `因为你是 ${att}（${
          isI ? "内向" : "外向"
        }），所以主导功能必须是${
          isI ? "内向" : "外向"
        }功能。\n❌ 排除：${excluded.join("、")} → 它们都是${
          isI ? "外向" : "内向"
        }功能，不可能是主导。\n✅ 剩余选项：${remaining.join("、")}`,
        remaining,
        excluded,
      };
    }
    case 1: {
      // 第二步：根据 I/E 和 J/P 确定功能类型
      let theoreticalExclusions: string[] = [];

      if (isI) {
        // 内向型
        if (isP) {
          // IP型：主导功能是判断功能，排除感知功能
          theoreticalExclusions = ["Ni", "Si"];
        } else {
          // IJ型：主导功能是感知功能，排除判断功能
          theoreticalExclusions = ["Ti", "Fi"];
        }
      } else {
        // 外向型
        if (isP) {
          // EP型：主导功能是感知功能，排除判断功能
          theoreticalExclusions = ["Te", "Fe"];
        } else {
          // EJ型：主导功能是判断功能，排除感知功能
          theoreticalExclusions = ["Ne", "Se"];
        }
      }

      // 实际能排除的（与剩余选项的交集）
      excluded = theoreticalExclusions.filter((f) => remaining.includes(f));
      remaining = remaining.filter((f) => !excluded.includes(f));

      return {
        result: `${li}（${isP ? "感知" : "判断"}）`,
        explanation: `你是 ${att}${li} 型 → ${isI ? "内" : "外"}向${
          isP ? "P" : "J"
        }型，所以主导功能必须是${
          isI ? (isP ? "判断" : "感知") : isP ? "感知" : "判断"
        }功能。\n❌ 理论上要排除：${theoreticalExclusions.join("、")} → 它们是${
          isI ? (isP ? "感知" : "判断") : isP ? "判断" : "感知"
        }功能，不可能是你的主导功能。${
          excluded.length === 0
            ? "\n💡 但是这些功能在上一步已经被排除了"
            : `\n实际排除：${excluded.join("、")}`
        }\n✅ 剩余选项：${remaining.join("、")}`,
        remaining,
        excluded,
      };
    }
    case 2: {
      // 第三步：根据 S/N 和 T/F 排除
      const excludedByPreference = remaining.filter(
        (c) =>
          (pe === "S" && c.includes("N")) ||
          (pe === "N" && c.includes("S")) ||
          (ju === "T" && c.includes("F")) ||
          (ju === "F" && c.includes("T"))
      );
      excluded = excludedByPreference;
      remaining = remaining.filter((f) => !excluded.includes(f));
      return {
        result: `${pe}（${pe === "S" ? "实感" : "直觉"}），${ju}（${
          ju === "T" ? "思维" : "情感"
        }）`,
        explanation: `感知偏好是 ${pe}（${
          pe === "S" ? "实感" : "直觉"
        }），判断偏好是 ${ju}（${
          ju === "T" ? "思维" : "情感"
        }）\n❌ 排除：${excluded.join(
          "、"
        )} → 不符合你的偏好\n✅ 剩余选项：${remaining.join("、")}`,
        remaining,
        excluded,
      };
    }
    case 3: {
      // 第四步：确定主导功能
      // 获取前几步的筛选结果
      const step0Result: StepResult = getStepResult(mbti, 0);
      const step1Result: StepResult = getStepResult(
        mbti,
        1,
        step0Result.remaining
      );
      const step2Result: StepResult = getStepResult(
        mbti,
        2,
        step1Result.remaining
      );

      // 经过前三步的筛选后，应该只剩下一个选项作为主导功能
      const dom: string = step2Result.remaining[0];

      // 确保 dom 是有效的认知功能
      if (
        !cognitiveFunctions.types[dom as keyof typeof cognitiveFunctions.types]
      ) {
        return {
          result: "错误",
          explanation: "无法确定主导功能",
          remaining: [],
          excluded: [],
        };
      }

      const funcType =
        cognitiveFunctions.types[dom as keyof typeof cognitiveFunctions.types];

      return {
        result: dom,
        explanation: `经过前三步的筛选，得到主导功能：${dom}（${funcType.name}）\n${funcType.description}`,
        remaining: [dom],
        excluded: step2Result.remaining.filter((f) => f !== dom),
      };
    }
    case 4: {
      // 第五步：确定辅助功能
      const auxOri = isI ? "e" : "i";
      const aux = isJext
        ? pe === "S"
          ? `S${auxOri}`
          : `N${auxOri}`
        : ju === "T"
        ? `T${auxOri}`
        : `F${auxOri}`;
      const funcType =
        cognitiveFunctions.types[aux as keyof typeof cognitiveFunctions.types];
      return {
        result: aux,
        explanation: `辅助功能必须是${auxOri === "e" ? "外" : "内"}向的${
          isJext ? "感知" : "判断"
        }功能，所以是 ${aux}（${funcType.name}）\n${funcType.description}`,
        remaining: [aux],
        excluded: remaining.filter((f) => f !== aux),
      };
    }
    case 5: {
      // 第六步：确定第三功能
      const third = isJext
        ? ju === "T"
          ? ju === "T"
            ? "Fe"
            : "Te"
          : pe === "S"
          ? "Ni"
          : "Si"
        : pe === "S"
        ? "Ne"
        : "Se";
      const funcType =
        cognitiveFunctions.types[
          third as keyof typeof cognitiveFunctions.types
        ];
      return {
        result: third,
        explanation: `第三功能是与辅助功能相对的功能：${
          isJext
            ? ju === "T"
              ? "思维→情感"
              : pe === "S"
              ? "实感→直觉"
              : "直觉→实感"
            : pe === "S"
            ? "实感→直觉"
            : "直觉→实感"
        }，所以是 ${third}（${funcType.name}）\n${funcType.description}`,
        remaining: [third],
        excluded: remaining.filter((f) => f !== third),
      };
    }
    case 6: {
      // 第七步：确定劣势功能
      const fourth = isJext
        ? ju === "T"
          ? ju === "T"
            ? "Fi"
            : "Ti"
          : pe === "S"
          ? "Ne"
          : "Se"
        : pe === "S"
        ? "Ni"
        : "Si";
      const funcType =
        cognitiveFunctions.types[
          fourth as keyof typeof cognitiveFunctions.types
        ];
      return {
        result: fourth,
        explanation: `劣势功能是与主导功能相对的功能：${
          isJext
            ? ju === "T"
              ? "思维→情感"
              : pe === "S"
              ? "实感→直觉"
              : "直觉→实感"
            : pe === "S"
            ? "实感→直觉"
            : "直觉→实感"
        }，所以是 ${fourth}（${funcType.name}）\n${funcType.description}`,
        remaining: [fourth],
        excluded: remaining.filter((f) => f !== fourth),
      };
    }
    default:
      return {
        result: "",
        explanation: "",
        remaining: [],
        excluded: [],
      };
  }
};

const steps: Step[] = [
  {
    title: "第一步：确定主导功能的内外向",
    description: "看第一个字母 E/I",
    getResult: (mbti) => getStepResult(mbti, 0),
  },
  {
    title: "第二步：确定外向功能是判断还是感知",
    description: "看第四个字母 J/P",
    getResult: (mbti) => {
      const step0Result = getStepResult(mbti, 0);
      return getStepResult(mbti, 1, step0Result.remaining);
    },
  },
  {
    title: "第三步：确定感知和判断的偏好",
    description: "看第二字母 S/N 和第三字母 T/F",
    getResult: (mbti) => {
      const step0Result = getStepResult(mbti, 0);
      const step1Result = getStepResult(mbti, 1, step0Result.remaining);
      return getStepResult(mbti, 2, step1Result.remaining);
    },
  },
  {
    title: "第四步：确定主导功能",
    description: "综合前三步的结论",
    getResult: (mbti) => getStepResult(mbti, 3),
  },
  {
    title: "第五步：确定辅助功能",
    description: "主导的反方向 + 另一种功能",
    getResult: (mbti) => getStepResult(mbti, 4),
  },
  {
    title: "第六步：确定第三功能",
    description: "辅助功能的镜像",
    getResult: (mbti) => getStepResult(mbti, 5),
  },
  {
    title: "第七步：确定劣势功能",
    description: "主导功能的镜像",
    getResult: (mbti) => getStepResult(mbti, 6),
  },
];

interface MBTICognitiveFunctionsProps {
  type: MBTIType;
}

export function MBTICognitiveFunctions({ type }: MBTICognitiveFunctionsProps) {
  const colorStyle = getMbtiColor(type.group);

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
              className="mb-4 last:mb-0"
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-xs",
                    colorStyle.bg
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1.5">
                  <motion.h4
                    {...mbtiMotionStyles}
                    className={cn(mbtiCardTitle, colorStyle.text, "text-sm")}
                  >
                    {step.title}
                  </motion.h4>
                  <motion.p
                    {...mbtiMotionStyles}
                    className={cn(mbtiCardDescription, "text-xs")}
                  >
                    {step.description}
                  </motion.p>
                  <motion.div
                    {...mbtiMotionStyles}
                    className={cn(
                      "rounded-lg p-2 font-medium text-xs",
                      colorStyle.bg,
                      colorStyle.text
                    )}
                  >
                    {stepResult.result}
                  </motion.div>
                  <motion.div
                    {...mbtiMotionStyles}
                    className={cn(
                      "rounded-lg p-2 whitespace-pre-line text-xs",
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

      <motion.div {...mbtiMotionStyles} className="p-4 space-y-3">
        {type.cognitiveFunctions.split(" ").map((funcName, index) => {
          const funcType =
            cognitiveFunctions.types[funcName as CognitiveFunctionName];
          const level = cognitiveFunctions.levels[index];

          return (
            <motion.div
              key={funcName}
              {...mbtiMotionStyles}
              className={cn(
                "relative flex flex-col gap-3 p-4 rounded-xl transition-all duration-200",
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

              {/* Header Section */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-xl",
                    "bg-white dark:bg-gray-800"
                  )}
                >
                  {funcType.icon}
                </div>

                {/* Title Area */}
                <div className="flex-1 min-w-0">
                  {/* Level Info */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-lg">{level.icon}</span>
                    <h4
                      className={cn("font-semibold text-sm", colorStyle.text)}
                    >
                      {level.name}
                    </h4>
                  </div>

                  {/* Function Type */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded font-mono text-xs font-medium",
                        colorStyle.bg,
                        colorStyle.text,
                        "bg-opacity-10 dark:bg-opacity-20"
                      )}
                    >
                      {funcName}
                    </span>
                    <span className="font-medium text-xs text-gray-800 dark:text-gray-200">
                      {funcType.name}
                    </span>
                  </div>

                  {/* Skill Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        熟练度
                      </span>
                      <span className={cn("font-medium", colorStyle.text)}>
                        {
                          [
                            "精通 (80%)",
                            "熟练 (60%)",
                            "进阶 (40%)",
                            "入门 (20%)",
                          ][index]
                        }
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          colorStyle.bgDark
                        )}
                        style={{
                          width: [
                            "80%", // 主导功能
                            "60%", // 辅助功能
                            "40%", // 第三功能
                            "20%", // 劣势功能
                          ][index],
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stack Level */}
                <div
                  className={cn(
                    "flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium",
                    colorStyle.bg,
                    colorStyle.text,
                    "bg-opacity-10 dark:bg-opacity-20"
                  )}
                >
                  {`#${index + 1}`}
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-3 pl-[52px]">
                {/* Quick Description */}
                <div
                  className={cn(
                    "p-2 rounded-lg text-xs",
                    colorStyle.bg,
                    "bg-opacity-5 dark:bg-opacity-10"
                  )}
                >
                  <p className="text-gray-800 dark:text-gray-200">
                    {funcType.description}
                  </p>
                </div>

                {/* Detailed Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left Column */}
                  <div className="space-y-2">
                    {/* Definition */}
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        定义
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {funcType.definition}
                      </p>
                    </div>

                    {/* Characteristics */}
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        特征
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {funcType.characteristics}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2">
                    {/* Training */}
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        加强训练方式
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {funcType.training}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        详细说明
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {funcType.details}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Level Description */}
                <div
                  className={cn(
                    "p-2 rounded-lg border text-xs",
                    "border-gray-100 dark:border-gray-800",
                    "bg-gray-50 dark:bg-gray-800/50"
                  )}
                >
                  <p className="text-gray-600 dark:text-gray-400">
                    {level.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
