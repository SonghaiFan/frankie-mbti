import { GoogleGenAI, Type, type FunctionDeclaration, type Content, type Part } from "@google/genai";
import {
  mbtiTypes,
  cognitiveFunctions,
  mbtiMatches,
  relationOf,
  typeLore,
} from "@/data/core/mbti-data";
import { allClaims, type ClaimRecord } from "@/data/claims";
import sources from "@/data/claims/sources.json";
import vocab from "@/data/claims/vocab.json";
import { getClaimsForType } from "@/services/claims-service";

// Map source index -> source title
const SOURCE_TITLE_MAP = new Map<number, string>(
  sources.map((s) => [s.index, s.title])
);

// ---------------------------------------------------------------------------
// Tool Declarations for Gemini API
// ---------------------------------------------------------------------------

export const AGENT_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_claims",
    description:
      "在 Frank MBTI 知识图谱的 1,251 条原子观点库中进行多维检索，支持按 MBTI 类型、场景上下文、观点类别、认知功能或关键词搜索。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description:
            "搜索关键词，如'内耗'、'合盘'、'职场'、'拖延'、'说服'、'冷战'、'装王'等。",
        },
        type: {
          type: Type.STRING,
          description: "目标 MBTI 类型（大写四字母，如 INTJ, INFP, ENTP 等）。",
        },
        context: {
          type: Type.STRING,
          description:
            "生活场景上下文，可选值：职场、亲密关系、沟通、情绪、金钱、成长、朋友、家庭、社交、决策、冲突、内省、学习。",
        },
        kind: {
          type: Type.STRING,
          description:
            "观点类别代码，可选值：OBSERVATION（真实观察）、ADVICE（破局建议）、BOUNDARY（攻守边界）、STRENGTH（核心优势）、VULNERABILITY（软肋弱点）、CORE_PARADOX（核心悖论）、MISCONCEPTION（大众误区）。",
        },
        functionCode: {
          type: Type.STRING,
          description: "荣格认知功能代码，可选值：Ni, Ne, Si, Se, Ti, Te, Fi, Fe。",
        },
        limit: {
          type: Type.NUMBER,
          description: "返回的最大条数，默认为 5，最多 8 条。",
        },
      },
    },
  },
  {
    name: "get_type_profile",
    description:
      "查询特定 MBTI 类型的完整内核画像，包含核心悖论、生动比喻、认知能量模型、口号、人设原型、表象与真实特质、易错型以及内在阴影人格。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: "目标 MBTI 类型（如 INTJ, INTP, INFP, INFJ 等）。",
        },
      },
      required: ["type"],
    },
  },
  {
    name: "get_pair_dynamics",
    description:
      "查询两两 MBTI 类型之间的深度配对关系、Beebe 八位能量槽位交互特征（如英雄对宿敌、灵魂对英雄等）、作者经典 CP 解读与攻守化解之道。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type1: {
          type: Type.STRING,
          description: "第一种 MBTI 类型（如 INTJ）。",
        },
        type2: {
          type: Type.STRING,
          description: "第二种 MBTI 类型（如 INFP 或 ENTJ）。",
        },
      },
      required: ["type1", "type2"],
    },
  },
  {
    name: "get_cognitive_axis",
    description:
      "查询荣格八维认知功能对极平衡轴（Ni-Se, Ne-Si, Ti-Fe, Te-Fi）或单一认知功能的详细深度解析，包含第一位英雄、第四位劣势（灵魂）、压力应激暴走形态与修炼路径。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        axisOrFunction: {
          type: Type.STRING,
          description:
            "平衡轴名称（如 'Ni-Se', 'Ti-Fe'）或单一功能代码（如 'Ni', 'Ti', 'Fi', 'Te', 'Se', 'Si', 'Ne', 'Fe'）。",
        },
      },
      required: ["axisOrFunction"],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool Execution Logic
// ---------------------------------------------------------------------------

export interface CitedClaim {
  id: string;
  sourceIndex: number;
  sourceTitle: string;
  statement: string;
  advice?: string;
  boundary?: string;
  kind?: string;
}

export async function executeAgentTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ result: unknown; citedClaims?: CitedClaim[] }> {
  switch (name) {
    case "search_claims": {
      const q = typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
      const type = typeof args.type === "string" ? args.type.trim().toUpperCase() : "";
      const context = typeof args.context === "string" ? args.context : undefined;
      const kind = typeof args.kind === "string" ? args.kind : undefined;
      const fnCode = typeof args.functionCode === "string" ? args.functionCode : undefined;
      const limit = Math.min(Math.max(typeof args.limit === "number" ? args.limit : 5, 1), 8);

      if (type && mbtiTypes.some((t) => t.type === type)) {
        // Query through claims service
        const res = await getClaimsForType({
          type,
          context,
          kind,
          function: fnCode,
          q,
          limit,
        });
        if (res && res.claims.length > 0) {
          const citedClaims: CitedClaim[] = res.claims.map((c) => ({
            id: c.id,
            sourceIndex: c.sourceIndex,
            sourceTitle: c.sourceTitle || SOURCE_TITLE_MAP.get(c.sourceIndex) || `专场 #${c.sourceIndex}`,
            statement: c.statement,
            advice: c.advice,
            boundary: c.boundary,
            kind: c.kindName,
          }));
          return {
            result: {
              source: res.source,
              type,
              totalFound: res.total,
              returnedCount: res.claims.length,
              claims: res.claims.map((c) => ({
                id: c.id,
                source: `#${c.sourceIndex} ${c.sourceTitle || SOURCE_TITLE_MAP.get(c.sourceIndex)}`,
                kind: c.kindName,
                statement: c.statement,
                advice: c.advice,
                boundary: c.boundary,
                traits: c.traits,
                contexts: c.contexts,
              })),
            },
            citedClaims,
          };
        }
      }

      // Cross-type search in allClaims
      let pool: ClaimRecord[] = allClaims;
      if (context) {
        pool = pool.filter((c) => c.contexts?.includes(context));
      }
      if (kind) {
        pool = pool.filter((c) => c.kind === kind);
      }
      if (fnCode) {
        pool = pool.filter((c) => c.functions?.some((f) => f.code === fnCode));
      }
      if (q) {
        pool = pool.filter(
          (c) =>
            c.statement.toLowerCase().includes(q) ||
            (c.advice && c.advice.toLowerCase().includes(q)) ||
            (c.boundary && c.boundary.toLowerCase().includes(q)) ||
            (c.traits && c.traits.some((t) => t.toLowerCase().includes(q))) ||
            (c.example && c.example.toLowerCase().includes(q))
        );
      }

      const sliced = pool.slice(0, limit);
      const citedClaims: CitedClaim[] = sliced.map((c) => ({
        id: c.id,
        sourceIndex: c.sourceIndex,
        sourceTitle: SOURCE_TITLE_MAP.get(c.sourceIndex) || `专场 #${c.sourceIndex}`,
        statement: c.statement,
        advice: c.advice,
        boundary: c.boundary,
        kind: vocab.kinds.find((k) => k.code === c.kind)?.name || c.kind,
      }));

      return {
        result: {
          query: args,
          totalMatches: pool.length,
          returned: sliced.map((c) => ({
            id: c.id,
            source: `#${c.sourceIndex} ${SOURCE_TITLE_MAP.get(c.sourceIndex)}`,
            statement: c.statement,
            advice: c.advice,
            boundary: c.boundary,
            traits: c.traits,
            contexts: c.contexts,
          })),
        },
        citedClaims,
      };
    }

    case "get_type_profile": {
      const code = typeof args.type === "string" ? args.type.trim().toUpperCase() : "";
      const profile = mbtiTypes.find((t) => t.type === code);
      if (!profile) {
        return { result: { error: `未找到类型 ${code} 的档案信息` } };
      }

      // Check mistypes lore
      const mistype = typeLore.mistypesAs.filter((m) => m.type === code || m.as === code);
      const inner = typeLore.harborsInner.filter((h) => h.type === code || h.inner === code);

      return {
        result: {
          type: profile.type,
          title: profile.title,
          nickname: profile.nickname,
          archetype: profile.archetype,
          coreParadox: profile.coreParadox,
          vividAnalogy: profile.vividAnalogy,
          energyModel: profile.energyModel,
          slogan: profile.slogan,
          cognitiveFunctions: profile.cognitiveFunctions,
          strengths: profile.strengths,
          weaknesses: profile.weaknesses,
          surfaceTraits: profile.surfaceTraits.slice(0, 10),
          actualTraits: profile.actualTraits.slice(0, 10),
          bestPartners: profile.bestPartners,
          mistypesLore: mistype,
          innerShadowLore: inner,
        },
      };
    }

    case "get_pair_dynamics": {
      const t1 = typeof args.type1 === "string" ? args.type1.trim().toUpperCase() : "";
      const t2 = typeof args.type2 === "string" ? args.type2.trim().toUpperCase() : "";

      if (!mbtiTypes.some((t) => t.type === t1) || !mbtiTypes.some((t) => t.type === t2)) {
        return { result: { error: `请输入合法的 MBTI 类型（如 INTJ, INFP）` } };
      }

      let relation = null;
      try {
        relation = relationOf(t1, t2);
      } catch {
        // Fallback
      }

      // Match canonical pairings
      const match = mbtiMatches.find(
        (m) =>
          (m.pair[0] === t1 && m.pair[1] === t2) ||
          (m.pair[0] === t2 && m.pair[1] === t1)
      );

      return {
        result: {
          pair: [t1, t2],
          relationName: relation?.name ?? "两两互动",
          signature: relation?.signature ?? "",
          relationReading: relation?.reading ?? "",
          authorCanonicalMatch: match
            ? {
                cpName: match.name,
                score: match.score,
                description: match.description,
              }
            : null,
        },
      };
    }

    case "get_cognitive_axis": {
      const input = typeof args.axisOrFunction === "string" ? args.axisOrFunction.trim() : "";

      // Check if it matches an axis
      const foundAxis = cognitiveFunctions.axes.find(
        (ax) =>
          ax.a.toLowerCase() === input.toLowerCase() ||
          ax.b.toLowerCase() === input.toLowerCase() ||
          `${ax.a}-${ax.b}`.toLowerCase() === input.toLowerCase() ||
          `${ax.b}-${ax.a}`.toLowerCase() === input.toLowerCase()
      );

      // Check if single function details
      let fnDetail: unknown = null;
      const fnCode = input.length === 2 ? input[0].toUpperCase() + input[1].toLowerCase() : "";
      if (fnCode) {
        const judging = (cognitiveFunctions.categories.judging.functions as Record<string, unknown>)[fnCode];
        const perceiving = (cognitiveFunctions.categories.perceiving.functions as Record<string, unknown>)[fnCode];
        fnDetail = judging || perceiving || null;
      }

      return {
        result: {
          query: input,
          axis: foundAxis ?? null,
          functionDetail: fnDetail,
          beebeLevels: cognitiveFunctions.levels,
        },
      };
    }

    default:
      return { result: { error: `未知工具调用: ${name}` } };
  }
}

// ---------------------------------------------------------------------------
// System Prompts for Frank MBTI Agent
// ---------------------------------------------------------------------------

export function getSystemPrompt(mode: "diagnose" | "consult"): string {
  const baseRules = `你是由 Frank MBTI 知识图谱驱动的【首席认知架构师 Agent】。
你拥有 16 种类型最纯正、最硬核的荣格八维动力学、John Beebe 8 槽位能量模型、136 组两两合盘矩阵，以及 1,251 条实录观点库。

【核心语言风格与态度】
1. 语言风格：犀利、通透、幽默、不装、富有生活现场感、直击灵魂痛点。采用标志性第三人称 \`ta\` 口吻（例如“ta 表面上是个高岭之花，脑子里早就给这事做好了十年规划”）。
2. 杜绝庸俗四字母标签：不搞“内向就是不爱说话、理性就是无情冷血”这种低幼巴纳姆套路。所有分析必须扎根于具体的认知功能运作（Ni/Ne/Si/Se/Ti/Te/Fi/Fe）和槽位表现（英雄、父母、少年、灵魂/劣势，以及阴影宿敌、恶魔）。
3. 讲人话：少堆砌生硬八股，用生动比喻解释复杂的心理机制（如“像折耳根”、“在宇宙超光速漫游，肉身在轮椅生锈”、“把爱自己外包给对方”）。
`;

  if (mode === "diagnose") {
    return `${baseRules}
【当前模式：MBTI 深度推导诊断模式 (Diagnostic Probing)】
用户的目标：搞清楚自己真实的 MBTI 类型，或者辨析两种极其纠结混淆的类型（如 INFP vs INFJ、INTJ vs INTP、ISFP vs INFP 等）。

【诊断行动指南】
1. **拒绝直接甩出一大堆机械化单选题！** 像老练的心理分析侦探一样，一次只抛出 1~2 个**生动、尖锐、具有强烈对撞反差的现实生活两难情境**。
2. **抓主干：探查主导功能 (Hero) 与劣势功能 (Inferior/灵魂)**：
   - 探查 Ti vs Te：面对一个有明显逻辑漏洞但能赚大钱的高效商业模式，你的第一反应是浑身难受想拆逻辑，还是先算怎么拿到结果？
   - 探查 Fi vs Fe：朋友找你哭诉一件事，你是在心里先体会“如果是我我会多委屈痛苦”（Fi），还是下意识调节氛围让场面不尴尬、照顾现场所有人的脸色（Fe）？
   - 探查 Ni vs Ne：遇到新问题，你是收敛式地直奔一个终局和必然规律（Ni），还是发散式地瞬间联想出八百种天马行空的可能性（Ne）？
   - 探查劣势功能暴走：极端崩溃或巨大压力下拉满时，你最本能的自毁/抓狂形态是什么？（暴饮暴食买买买 Se 劣势？变身刻薄工头列清单找人麻烦 Te 劣势？觉得自己被全世界抛弃没人爱 Fe 劣势？）
3. **结合图谱工具**：适时调用 \`get_type_profile\`、\`get_cognitive_axis\` 和 \`search_claims\` 调取该类型的经典核心悖论与易错型辨析依据。
4. **阶段性反馈与收网**：
   - 用户回答后，先一语中的地点评 ta 的心理机制反应（“你刚才这个反应，是极其典型的 Fi 过滤机制…”）；
   - 明确告知当前排除了什么、锁定了什么，缩小嫌疑范围，逐步推导出最终类型并解释其能量模型。`;
  }

  return `${baseRules}
【当前模式：知识图谱深度答疑与破局模式 (Consult & Advisory)】
用户的目标：针对情感合盘、职场卡点、人际相处矛盾、个人精神内耗或自我发展瓶颈，寻求深度洞察与破局建议。

【答疑行动指南】
1. **必须调用图谱工具检索实据**：
   - 用户提到具体类型或两人互动时，调用 \`get_pair_dynamics\`、\`get_type_profile\`、\`search_claims\` 检索相关的实录观点。
2. **回答中必须显式注明引用的观点微标签**：
   - 格式如 \`[#524 诗人与刺客]\`、\`[#507 双装王之争]\`、\`[#134 高岭之花的十年之约]\` 等，增强建议的真实性与深度。
3. **结构化输出高质量建议**：
   - **【本质剖析】**：直击两个人认知功能槽位或个体功能冲突的根本症结；
   - **【攻守边界 (Boundary)】**：明确界定什么该守、什么别碰、底线在哪；
   - **【破局解法 (Advice)】**：给出极其具体、可操作的破局实操路径，不打空心鸡血。`;
}

// ---------------------------------------------------------------------------
// Offline Heuristic Generator (Zero-fail fallback when no API key is set)
// ---------------------------------------------------------------------------

export async function generateOfflineHeuristicResponse(
  userQuery: string,
  mode: "diagnose" | "consult"
): Promise<{ text: string; citations: CitedClaim[] }> {
  // Extract any MBTI types mentioned
  const matches = userQuery.toUpperCase().match(/\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/g);
  const detectedTypes = matches ? Array.from(new Set(matches)) : [];

  let citations: CitedClaim[] = [];
  let text = "";

  if (mode === "diagnose") {
    if (detectedTypes.length >= 2) {
      const [t1, t2] = detectedTypes;
      const p1 = mbtiTypes.find((t) => t.type === t1);
      const p2 = mbtiTypes.find((t) => t.type === t2);
      const searchRes = await executeAgentTool("search_claims", {
        type: t1,
        query: "辨析",
        limit: 3,
      });
      citations = searchRes.citedClaims || [];

      text = `来，我们直接把 **${t1}**（${p1?.title}）和 **${t2}**（${p2?.title}）的防御外壳拆开，不做那种幼儿园单选题。

### 核心认知轴的本质分野
- **${t1} 的主导动力**：\`${p1?.cognitiveFunctions}\`，${p1?.energyModel}
- **${t2} 的主导动力**：\`${p2?.cognitiveFunctions}\`，${p2?.energyModel}

---

### 场景拷问一：面对突如其来的烂摊子
假设你精心策划的一个项目突然被外部不可抗力打碎，所有人都在慌乱：
1. **A 选项**：你的本能是瞬间在脑中收敛出一条唯一的避险路径，甚至有点冷酷地让所有人按你的既定方案执行，容不得废话？
2. **B 选项**：你的本能是脑洞大开，瞬间发散出五种不同的应对备选方案，甚至在混乱里莫名体会到一种探险的刺激感？

### 场景拷问二：夜深人静时的精神内耗
你平时内耗的时候，是觉得：
- “这个世界的荒谬和虚伪让我恶心，但我必须找到它背后的运行规律”（内倾直觉/思考）；
- 还是“我内心深处最珍视的那块净土，是不是又被别人随便践踏和误解了”（内倾情感）？

> 把你最真实的第一直觉告诉我，不用思考怎么选显得高尚。我们一步步把你的功能栈定位清楚。
*(注：当前为内置图谱离线推导模式。在右上角配置 Gemini API Key 后可解锁全量智能多轮追问)*`;
    } else {
      const t = detectedTypes[0] || "INFP";
      const profile = mbtiTypes.find((x) => x.type === t);
      const searchRes = await executeAgentTool("search_claims", {
        type: t,
        limit: 3,
      });
      citations = searchRes.citedClaims || [];

      text = `想推导自己的真实 MBTI？（当前参考：**${t} · ${profile?.title || ""}**）太好了，我们先扔掉那些“你喜不喜欢参加聚会”的表面问卷。

真正决定你类型的，是你**在无意识状态下最依赖的认知功能（英雄位）**，以及**压力拉满时突然暴走的劣势功能（灵魂位）**。

### 场景拷问：先测你的认知第一手
假设一个关系一般但有些利益往来的熟人，突然在微信上找你借一笔不小的钱，并声泪俱下地讲述 ta 的悲惨遭遇。
你关掉聊天框的第一秒，脑海里划过的第一个真实念头是什么？

1. **逻辑漏洞审查**：“这套话术前后矛盾，按 ta 的收支不可能走到这一步，不借。”（Ti/Te 优先）
2. **情绪场域共振**：“天哪这也太惨了，我要是不帮 ta 会不会出事，但我借了我也难受…”（Fi/Fe 优先）
3. **全局因果预判**：“不用看都知道这是个填不满的无底洞，借了必反目，直接找理由回绝。”（Ni 优先）
4. **现实事实确认**：“先打电话问共同朋友 ta 说的到底是不是真的，求证细节。”（Si/Se 优先）

告诉我你的第一反应，以及你平时工作/生活里最累、最容易炸毛的情境是什么？我来帮你剥离假象。
*(注：当前为内置图谱离线推导模式。配置 Gemini API Key 后可解锁更敏锐的动态反问)*`;
    }
  } else {
    // Consult mode
    if (detectedTypes.length >= 2) {
      const [t1, t2] = detectedTypes;
      const pairRes = await executeAgentTool("get_pair_dynamics", {
        type1: t1,
        type2: t2,
      });
      const claimsRes = await executeAgentTool("search_claims", {
        type: t1,
        query: t2,
        limit: 4,
      });
      citations = claimsRes.citedClaims || [];

      interface PairDynamicsResult {
        pair?: [string, string];
        relationName?: string;
        signature?: string;
        relationReading?: string;
        authorCanonicalMatch?: {
          cpName: string;
          score: number;
          description: string;
        } | null;
        error?: string;
      }
      const pairData = pairRes.result as PairDynamicsResult;
      text = `关于 **${t1}** 与 **${t2}** 的相处动力学，我们在知识图谱中检索到了这组关系的深层脉络：

### 1. 认知功能互动本质：【${pairData.relationName || "两两互动"}】
- **槽位对应读法**：${pairData.relationReading || "功能栈相互对应"}
${
  pairData.authorCanonicalMatch
    ? `- **作者实录评级**：${pairData.authorCanonicalMatch.cpName}（契合指数：${pairData.authorCanonicalMatch.score}分）\n  *“${pairData.authorCanonicalMatch.description}”*`
    : ""
}

### 2. 核心冲突与潜意识雷区
${t1} 和 ${t2} 走在一起，最容易发生的问题从来不是“不爱”，而是**认知节奏的严重错位**。
一个习惯于长驱直入求结论，另一个可能还在感受的情绪隧道里漫游；或者一个把防御伪装成冷漠，另一个把索求伪装成懂事。

### 3. Frank MBTI 破局实操法则
- **守住攻守边界**：千万别试图去改造对方的前两位功能。对方最顺手的地方，往往正是你最看不懂、但潜意识最嫉妒的特质。
- **降维沟通**：用清晰的行动协议代替“你猜我在想什么”。把内心的真实脆弱直截了当说出来，反而能瞬间化解对方的战斗戒备。

*(注：当前为内置图谱离线推导模式。配置 Gemini API Key 可针对具体情境进行更深入的实时研判)*`;
    } else {
      const t = detectedTypes[0] || "INTJ";
      const profile = mbtiTypes.find((x) => x.type === t);
      const claimsRes = await executeAgentTool("search_claims", {
        type: t,
        query: userQuery,
        limit: 4,
      });
      citations = claimsRes.citedClaims || [];

      text = `针对你的困惑，我们调取了 **${t}（${profile?.title}）** 的图谱核心特质与论断：

### 1. 症结本质：${profile?.coreParadox || "认知能量错位"}
很多时候我们以为的“人际障碍”或“职场内耗”，归根结底是**主导功能过度代偿，而劣势功能在地下室抗议**：
- **能量模型**：${profile?.energyModel}
- **典型表现**：${profile?.vividAnalogy}

### 2. 来自原声观点库的核心洞察
${
  citations.length > 0
    ? citations
        .map(
          (c) =>
            `> **[#${c.sourceIndex} ${c.sourceTitle}]**：${c.statement}${
              c.advice ? `\n> *建议*：${c.advice}` : ""
            }`
        )
        .join("\n\n")
    : "> 很多内耗的本质是：拿自己的第三功能和劣势功能去迎合别人的第一功能，最后丢了自己的主场。"
}

### 3. 破局实操指南
1. **卸下防御代偿**：${profile?.slogan}
2. **给劣势功能松绑**：不要在压力最大的时候强行逼自己做到八面玲珑。允许自己有短板，才是成熟的标志。

*(注：当前为内置图谱离线推导模式。配置 Gemini API Key 后可解锁针对复杂生活情境的实时智能交互)*`;
    }
  }

  return { text, citations };
}

// ---------------------------------------------------------------------------
// Run Agent Chat (Streaming Generator with Tool Calling Loop)
// ---------------------------------------------------------------------------

export interface AgentStreamEvent {
  type: "tool_call" | "tool_result" | "text_delta" | "citation" | "done" | "error" | "engine";
  name?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  text?: string;
  citation?: CitedClaim;
  message?: string;
  engine?: "gemini" | "offline_graph";
  model?: string;
}

// ---------------------------------------------------------------------------
// Health check / ping function for Gemini connection
// ---------------------------------------------------------------------------

export async function testGeminiConnection(apiKey?: string, model?: string): Promise<{
  ok: boolean;
  model: string;
  latencyMs: number;
  error?: string;
}> {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
  if (!effectiveKey) {
    return {
      ok: false,
      model: model || "gemini-3.8-flash",
      latencyMs: 0,
      error: "未配置 API Key（可在 .env.local 或输入框中配置）",
    };
  }

  const ai = new GoogleGenAI({ apiKey: effectiveKey });
  const testModel = model || "gemini-3.8-flash";
  const start = Date.now();

  try {
    const res = await ai.models.generateContent({
      model: testModel,
      contents: "hi",
    });
    if (!res.text) throw new Error("模型返回了空响应");
    return {
      ok: true,
      model: testModel,
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      model: testModel,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Call Gemini with Multi-Model Fallback & Retry
// ---------------------------------------------------------------------------

async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: Content[];
    systemInstruction: string;
    preferredModel?: string;
  }
) {
  const candidateModels = [
    params.preferredModel,
    process.env.GEMINI_MODEL,
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ].filter((m, idx, arr): m is string => Boolean(m) && arr.indexOf(m) === idx);

  let lastErr: unknown = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            tools: [{ functionDeclarations: AGENT_TOOLS }],
          },
        });
        return { response, model };
      } catch (err: unknown) {
        lastErr = err;
        const errStr = String(err);
        const isTransient =
          errStr.includes("503") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("high demand") ||
          errStr.includes("429") ||
          errStr.includes("RESOURCE_EXHAUSTED");

        if (!isTransient) {
          throw err;
        }

        // Wait before retry or moving to fallback model
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  throw lastErr;
}

export async function* runMbtiAgentChat(params: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  mode: "diagnose" | "consult";
  apiKey?: string;
  model?: string;
}): AsyncGenerator<AgentStreamEvent> {
  const { messages, mode, apiKey, model } = params;
  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!effectiveApiKey) {
    yield { type: "engine", engine: "offline_graph" };

    // Fallback to intelligent offline heuristic generator
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const { text, citations } = await generateOfflineHeuristicResponse(lastUserMsg, mode);

    for (const c of citations) {
      yield { type: "citation", citation: c };
    }

    // Stream text in small chunks for realistic typewriter feeling
    const chunkSize = 24;
    for (let i = 0; i < text.length; i += chunkSize) {
      yield { type: "text_delta", text: text.slice(i, i + chunkSize) };
      await new Promise((r) => setTimeout(r, 20));
    }

    yield { type: "done" };
    return;
  }

  // Initialize Google GenAI client
  const ai = new GoogleGenAI({
    apiKey: effectiveApiKey,
  });

  const systemInstruction = getSystemPrompt(mode);

  // Convert incoming messages into Content format
  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const allCitedClaims: CitedClaim[] = [];

  try {
    let turns = 0;
    const maxToolTurns = 4;

    while (turns < maxToolTurns) {
      turns++;

      // Request generation with tool calling & model fallback
      const { response, model: usedModel } = await callGeminiWithFallback(ai, {
        contents,
        systemInstruction,
        preferredModel: model,
      });

      yield { type: "engine", engine: "gemini", model: usedModel };

      const candidate = response.candidates?.[0];
      if (!candidate || !candidate.content) {
        throw new Error("Gemini API 返回了空内容");
      }

      // Append model turn to conversation history
      contents.push(candidate.content);

      // Check if the model made any function calls
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const functionResponseParts: Part[] = [];

        for (const fc of functionCalls) {
          const toolName = fc.name || "";
          if (!toolName) continue;

          yield {
            type: "tool_call",
            name: toolName,
            args: fc.args,
          };

          const execution = await executeAgentTool(toolName, fc.args as Record<string, unknown>);

          if (execution.citedClaims) {
            for (const claim of execution.citedClaims) {
              if (!allCitedClaims.some((c) => c.id === claim.id)) {
                allCitedClaims.push(claim);
                yield {
                  type: "citation",
                  citation: claim,
                };
              }
            }
          }

          yield {
            type: "tool_result",
            name: toolName,
            result: execution.result,
          };

          functionResponseParts.push({
            functionResponse: {
              name: toolName,
              response: { result: execution.result },
            },
          });
        }

        // Feed function responses back to the model
        contents.push({
          role: "user",
          parts: functionResponseParts,
        });

        // Continue loop to let model produce final response or next call
        continue;
      }

      // No more function calls, stream the final response if available
      if (response.text) {
        const text = response.text;
        const chunkSize = 16;
        for (let i = 0; i < text.length; i += chunkSize) {
          yield { type: "text_delta", text: text.slice(i, i + chunkSize) };
          await new Promise((r) => setTimeout(r, 15));
        }
      }

      yield { type: "done" };
      return;
    }

    yield { type: "done" };
  } catch (err: unknown) {
    const errStr = String(err);
    const isTransient =
      errStr.includes("503") ||
      errStr.includes("UNAVAILABLE") ||
      errStr.includes("high demand") ||
      errStr.includes("429") ||
      errStr.includes("RESOURCE_EXHAUSTED");

    if (isTransient) {
      console.warn("Upstream Gemini models capacity spike (503/429), serving graph-grounded response.");
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      const { text, citations } = await generateOfflineHeuristicResponse(lastUserMsg, mode);

      for (const c of citations) {
        yield { type: "citation", citation: c };
      }

      const notice = "\n\n> 💡 *注：Google Gemini 上游服务当前并发负载较高（503 临时繁忙），系统已自动无缝切换至本地知识图谱引擎为您回答，核心观点与合盘推导不受影响。*";
      const fullText = text + notice;

      const chunkSize = 20;
      for (let i = 0; i < fullText.length; i += chunkSize) {
        yield { type: "text_delta", text: fullText.slice(i, i + chunkSize) };
        await new Promise((r) => setTimeout(r, 15));
      }

      yield { type: "done" };
      return;
    }

    const message = err instanceof Error ? err.message : "Agent 处理失败，请检查 API Key 或网络设置";
    console.error("Gemini Agent Execution Error:", err);
    yield {
      type: "error",
      message,
    };
  }
}
