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
      return {
        result: `${li}（${isP ? "感知" : "判断"}）`,
        explanation: isI
          ? isP
            ? `你是 P 型，而且是 I → 所以外向功能是感知功能，只能是 Ne 或 Se。\n❌ 排除：Fe、Te（判断功能）→ 不可能是你的辅助功能。`
            : `你是 J 型，而且是 I → 所以外向功能是判断功能，只能是 Fe 或 Te。\n❌ 排除：Ne、Se（感知功能）→ 不可能是你的辅助功能。`
          : isP
          ? `你是 P 型，而且是 E → 所以主导功能是感知功能，只能是 Ne 或 Se。\n❌ 排除：Fe、Te（判断功能）→ 不可能是你的主导功能。`
          : `你是 J 型，而且是 E → 所以主导功能是判断功能，只能是 Fe 或 Te。\n❌ 排除：Ne、Se（感知功能）→ 不可能是你的主导功能。`,
      };
    },
  },
  {
    title: "第三步：确定感知和判断的偏好",
    description: "看第二字母 S/N 和第三字母 T/F",
    getResult: (mbti) => {
      const [, pe, ju] = mbti;
      return {
        result: `${pe}（${pe === "S" ? "实感" : "直觉"}），${ju}（${
          ju === "T" ? "思维" : "情感"
        }）`,
        explanation: `感知偏好是 ${pe} → 所以你使用 ${pe}e 或 ${pe}i（${
          pe === "S" ? "实感" : "直觉"
        }功能）\n判断偏好是 ${ju} → 所以你使用 ${ju}i 或 ${ju}e（${
          ju === "T" ? "思维" : "情感"
        }判断）\n❌ 排除：${pe === "S" ? "N → Ni/Ne" : "S → Si/Se"}；${
          ju === "T" ? "F → Fi/Fe" : "T → Ti/Te"
        } → 都不是你的偏好`,
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

      let explanation;
      if (isI) {
        if (isJext) {
          explanation = `你主导必须是内向判断功能 → 只能是 ${ju}i\n❌ 排除：${pe}i → 虽然是内向，但它是感知功能；${
            ju === "T" ? "Fi" : "Ti"
          } → 是${ju === "T" ? "情感" : "逻辑"}判断，不符合 ${ju} 倾向`;
        } else {
          explanation = `你主导必须是内向感知功能 → 只能是 ${pe}i\n❌ 排除：${ju}i → 虽然是内向，但它是判断功能；${
            pe === "S" ? "Ni" : "Si"
          } → 是${pe === "S" ? "直觉" : "实感"}感知，不符合 ${pe} 倾向`;
        }
      } else {
        if (isJext) {
          explanation = `你主导必须是外向判断功能 → 只能是 ${ju}e\n❌ 排除：${pe}e → 虽然是外向，但它是感知功能；${
            ju === "T" ? "Fe" : "Te"
          } → 是${ju === "T" ? "情感" : "逻辑"}判断，不符合 ${ju} 倾向`;
        } else {
          explanation = `你主导必须是外向感知功能 → 只能是 ${pe}e\n❌ 排除：${ju}e → 虽然是外向，但它是判断功能；${
            pe === "S" ? "Ne" : "Se"
          } → 是${pe === "S" ? "直觉" : "实感"}感知，不符合 ${pe} 倾向`;
        }
      }

      return {
        result: dom,
        explanation,
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

      let explanation;
      if (isI) {
        if (isJext) {
          explanation = `辅助功能必须是外向感知功能 → 候选是 ${pe}e\n❌ 排除：${
            pe === "S" ? "Ne" : "Se"
          }（你不偏好${pe === "S" ? "直觉" : "实感"}）`;
        } else {
          explanation = `辅助功能必须是外向判断功能 → 候选是 ${ju}e\n❌ 排除：${
            ju === "T" ? "Fe" : "Te"
          }（你不偏好${ju === "T" ? "情感" : "逻辑"}）`;
        }
      } else {
        if (isJext) {
          explanation = `辅助功能必须是内向感知功能 → 候选是 ${pe}i\n❌ 排除：${
            pe === "S" ? "Ni" : "Si"
          }（你不偏好${pe === "S" ? "直觉" : "实感"}）`;
        } else {
          explanation = `辅助功能必须是内向判断功能 → 候选是 ${ju}i\n❌ 排除：${
            ju === "T" ? "Fi" : "Ti"
          }（你不偏好${ju === "T" ? "情感" : "逻辑"}）`;
        }
      }

      return {
        result: aux,
        explanation,
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
        }向镜像，对应你的第三功能\n❌ 排除：${aux[0]}${
          aux[1]
        }（你用的是 ${aux}），${third[0]}${aux[1]}（是${
          aux[1] === "e" ? "外" : "内"
        }向）`,
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
        explanation: `${fourth} 是 ${dom} 的镜像，是你最不擅长的方向（${
          fourth[0] === "T"
            ? "做计划、逻辑执行"
            : fourth[0] === "F"
            ? "处理人际关系、表达情感"
            : fourth[0] === "S"
            ? "关注细节、实际操作"
            : "抽象思维、远景规划"
        }）\n❌ 排除：${
          dom[0] === "T"
            ? "F"
            : dom[0] === "F"
            ? "T"
            : dom[0] === "S"
            ? "N"
            : "S"
        }${fourth[1]} → 和你的 ${dom} 属于不同维度`,
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

      <motion.div
        {...mbtiMotionStyles}
        className={cn(mbtiCardContent, "grid grid-cols-1 md:grid-cols-2 gap-6")}
      >
        {[
          { func: dom, level: cognitiveFunctions.levels[0] },
          { func: aux, level: cognitiveFunctions.levels[1] },
          { func: third, level: cognitiveFunctions.levels[2] },
          { func: fourth, level: cognitiveFunctions.levels[3] },
        ].map(({ func, level }) => (
          <motion.div
            key={func.name}
            {...mbtiMotionStyles}
            className={cn(
              "p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow",
              "bg-white dark:bg-gray-800"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{level.icon}</span>
              <h4 className={cn("font-medium text-base", colorStyle.text)}>
                {level.name}：{func.name}
              </h4>
            </div>
            <p className={cn(mbtiCardDescription, "text-sm")}>
              {func.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
