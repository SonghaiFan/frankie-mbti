import { GoogleGenAI, Type, type FunctionDeclaration, type Content, type Part } from "@google/genai";
import neo4j from "neo4j-driver";
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
import { getNeo4jDriver, withNeo4jSession } from "@/lib/neo4j";

// Map source index -> source title
const SOURCE_TITLE_MAP = new Map<number, string>(
  sources.map((s) => [s.index, s.title])
);

const KIND_LIST = vocab.kinds.map((k) => `${k.code} ${k.name}`).join(", ");
const CONTEXT_LIST = vocab.contexts.map((c) => c.name).join("、");

// ---------------------------------------------------------------------------
// Graph schema, as the model sees it. Mirrors scripts/graph/migrate.mts.
// ---------------------------------------------------------------------------

export const GRAPH_SCHEMA = `节点
(:Type {code, title, nickname, slogan, archetype, coreParadox, vividAnalogy, energyModel, cognitiveFunctions, bestPartners})
(:Function {code: Ni|Ne|Si|Se|Ti|Te|Fi|Fe, name, ...})
(:Group {code, name, category, description, nickname})
(:Trait {name, category: strength|weakness|surface|actual|observed})
(:Claim {id, kind, kindName, statement, example, advice, boundary, sourceIndex})   id 形如 c028-01，前面的数字就是 sourceIndex
(:Source {index, title})   index 是整数，不是字符串
(:Context {name})   场景：${CONTEXT_LIST}
(:Nickname {name})  作者给某类型起的外号
(:Letter {code, name}) (:Dimension {name, code})

关系
(Type)-[:HAS_FUNCTION_SLOT {slot: 1..8, role, cnRole}]->(Function)   Beebe 八槽位，1 英雄 2 父母 3 少年 4 灵魂 5 宿敌 6 批评家 7 骗子 8 恶魔
(Type)-[:BELONGS_TO_GROUP]->(Group)
(Type)-[:HAS_TRAIT {category}]->(Trait)
(Type)-[:NICKNAMED {count}]->(Nickname)
(Type)-[:MISTYPES_AS {when, how, tell, note}]->(Type)   容易被误判成（目前只有 1 条）
(Type)-[:HARBORS_INNER {when, via, how}]->(Type)        内心藏着另一个类型（目前只有 2 条）
(Type)-[:COMPOSED_OF {slot}]->(Letter)-[:BELONGS_TO_DIMENSION]->(Dimension)
(Function)-[:PAIRED_AXIS {name, category, description}]->(Function)
(Type)-[r]->(Type) 两两配对，关系类型是功能栈对位方式之一：SAME_TYPE, SHADOW_MIRROR, DUAL_COMPLEMENT, DOMINANT_INFERIOR, AUXILIARY_TERTIARY, DOMINANT_AUXILIARY_SWAP, SHARED_DOMINANT, SHARED_MIDDLE, QUASI_IDENTICAL, FRONT_BACK_SWAP, SHADOW_REVERSED, SHADOW_SCRAMBLED, HALF_SHADOW, SHARED_ONE
   属性 {name: 作者给的 CP 名, relation: 关系中文名, reading: 这一方向的解读, score: 契合分, featured, description}，两个方向都有边
(Claim)-[:ABOUT]->(Type|Group)   1,251 条观点，一条可以同时讲多个类型；两个类型的辨析通常就是同时 ABOUT 这两个类型的观点
(Claim)-[:FROM_SOURCE]->(Source)
(Claim)-[:GROUNDED_IN {evidence: explicit|contextual|inferred}]->(Function)
(Claim)-[:SHOWS_TRAIT]->(Trait)
(Claim)-[:IN_CONTEXT]->(Context)

Claim.kind 取值：${KIND_LIST}

示例
- 某类型的完整功能栈：MATCH (t:Type {code:'INFJ'})-[s:HAS_FUNCTION_SLOT]->(f) RETURN s.slot, s.cnRole, f.code ORDER BY s.slot
- 两个类型在图谱里怎么对位：MATCH (a:Type {code:'INTJ'})-[r]->(b:Type {code:'INFP'}) WHERE r.reading IS NOT NULL RETURN type(r), r.name, r.reading, r.score
- INFP 和 INFJ 的辨析观点：MATCH (a:Type {code:'INFP'})<-[:ABOUT]-(c:Claim)-[:ABOUT]->(b:Type {code:'INFJ'}) WHERE c.kind = 'mistype' RETURN c.id, c.statement LIMIT 8
- 某类型被引用最多的场景：MATCH (:Type {code:'INTP'})<-[:ABOUT]-(c:Claim)-[:IN_CONTEXT]->(x:Context) RETURN x.name AS ctx, count(c) AS n ORDER BY n DESC
- 哪些观点同时讲到 Fi 和"冷战"：MATCH (c:Claim)-[:GROUNDED_IN]->(:Function {code:'Fi'}) WHERE c.statement CONTAINS '冷战' RETURN c.id, c.statement, c.advice LIMIT 5
- 某个特质在哪些类型上出现：MATCH (t:Type)-[:HAS_TRAIT]->(tr:Trait) WHERE tr.name CONTAINS '拖延' RETURN t.code, tr.name`;

// ---------------------------------------------------------------------------
// Tool Declarations for Gemini API
// ---------------------------------------------------------------------------

export const AGENT_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_claims",
    description:
      "在 1,251 条作者原声观点里检索。可按类型、场景、观点类别、认知功能或关键词过滤。想找某类型在某个情境下的具体说法时用这个。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "关键词，空格分隔多个词时任一命中即可，如 内耗、拖延、冷战。",
        },
        type: {
          type: Type.STRING,
          description: "MBTI 类型，大写四字母。",
        },
        context: {
          type: Type.STRING,
          description: `场景，可选：${CONTEXT_LIST}。`,
        },
        kind: {
          type: Type.STRING,
          description: `观点类别代码：${KIND_LIST}。分辨两个相近类型用 mistype。`,
        },
        functionCode: {
          type: Type.STRING,
          description: "认知功能：Ni, Ne, Si, Se, Ti, Te, Fi, Fe。",
        },
        limit: {
          type: Type.NUMBER,
          description: "最多返回几条，默认 5，上限 8。",
        },
      },
    },
  },
  {
    name: "get_type_profile",
    description:
      "取一个类型的档案：核心悖论、比喻、能量模型、功能栈、优势与软肋、表面特质与真实特质、容易被误判成谁、内心藏着谁。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: "MBTI 类型，如 INTJ。",
        },
      },
      required: ["type"],
    },
  },
  {
    name: "get_pair_dynamics",
    description:
      "取两个类型的配对关系：功能栈怎么对位、作者给这对 CP 的名字和评分、解读。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type1: {
          type: Type.STRING,
          description: "第一个类型。",
        },
        type2: {
          type: Type.STRING,
          description: "第二个类型。",
        },
      },
      required: ["type1", "type2"],
    },
  },
  {
    name: "get_cognitive_axis",
    description:
      "取一条功能轴（Ni-Se, Ne-Si, Ti-Fe, Te-Fi）或单个功能的说明，以及 Beebe 八槽位的定义。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        axisOrFunction: {
          type: Type.STRING,
          description: "轴名（如 Ni-Se）或功能代码（如 Fi）。",
        },
      },
      required: ["axisOrFunction"],
    },
  },
  {
    name: "query_graph",
    description: `对知识图谱直接执行一条只读 Cypher。上面四个工具覆盖不到的问题用这个：跨类型统计、多跳关系、按特质或外号反查类型、某个功能上的观点分布、误判链条等。查询会自动加 LIMIT（上限 50），只允许读操作。

图谱结构：
${GRAPH_SCHEMA}`,
    parameters: {
      type: Type.OBJECT,
      properties: {
        cypher: {
          type: Type.STRING,
          description: "一条只读 Cypher 语句。返回列请用 AS 起短名字。",
        },
        purpose: {
          type: Type.STRING,
          description: "一句话说明这条查询想确认什么，会展示给用户。",
        },
      },
      required: ["cypher"],
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

const WRITE_CLAUSE = /\b(CREATE|MERGE|DELETE|DETACH|SET|REMOVE|DROP|LOAD\s+CSV|FOREACH|CALL\s*\{|CALL\s+(db|dbms|apoc)\.|USE\s+|ALTER|GRANT|REVOKE|DENY|START|TERMINATE)\b/i;
const MAX_ROWS = 50;
const QUERY_TIMEOUT_MS = 8000;

/** Plain JSON out of neo4j values: Integer -> number, Node -> {labels, ...props}, etc. */
function toPlain(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (neo4j.isInt(value)) return (value as { toNumber(): number }).toNumber();
  if (neo4j.isNode(value)) {
    const n = value as { labels: string[]; properties: Record<string, unknown> };
    return { _labels: n.labels, ...mapValues(n.properties) };
  }
  if (neo4j.isRelationship(value)) {
    const r = value as { type: string; properties: Record<string, unknown> };
    return { _type: r.type, ...mapValues(r.properties) };
  }
  if (neo4j.isPath(value)) {
    const p = value as { segments: Array<{ start: unknown; relationship: unknown; end: unknown }> };
    return p.segments.map((s) => ({ start: toPlain(s.start), rel: toPlain(s.relationship), end: toPlain(s.end) }));
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === "object") return mapValues(value as Record<string, unknown>);
  return value;
}

function mapValues(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = toPlain(v);
  return out;
}

/** Claims that surfaced anywhere in a query result, so the UI can cite them. */
function collectClaims(rows: unknown[]): CitedClaim[] {
  const found = new Map<string, CitedClaim>();
  const visit = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }
    const o = v as Record<string, unknown>;
    const labels = o._labels as string[] | undefined;
    if (labels?.includes("Claim") && typeof o.id === "string" && typeof o.statement === "string") {
      found.set(o.id, {
        id: o.id,
        sourceIndex: Number(o.sourceIndex),
        sourceTitle: SOURCE_TITLE_MAP.get(Number(o.sourceIndex)) || `专场 #${o.sourceIndex}`,
        statement: o.statement,
        advice: typeof o.advice === "string" ? o.advice : undefined,
        boundary: typeof o.boundary === "string" ? o.boundary : undefined,
        kind: typeof o.kindName === "string" ? o.kindName : undefined,
      });
      return;
    }
    Object.values(o).forEach(visit);
  };
  visit(rows);
  // A row that returns c.id / c.statement as columns instead of the node.
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const o = row as Record<string, unknown>;
    const id = o["c.id"] ?? o.id;
    const statement = o["c.statement"] ?? o.statement;
    if (typeof id === "string" && /^c\d{3}-\d{2}$/.test(id) && typeof statement === "string" && !found.has(id)) {
      const local = allClaims.find((c) => c.id === id);
      if (local) {
        found.set(id, {
          id,
          sourceIndex: local.sourceIndex,
          sourceTitle: SOURCE_TITLE_MAP.get(local.sourceIndex) || `专场 #${local.sourceIndex}`,
          statement: local.statement,
          advice: local.advice,
          boundary: local.boundary,
          kind: vocab.kinds.find((k) => k.code === local.kind)?.name || local.kind,
        });
      }
    }
  }
  return [...found.values()];
}

function normalizeCypher(raw: string): { cypher: string; error?: string } {
  let cypher = raw.trim().replace(/^```(?:cypher)?\s*/i, "").replace(/```\s*$/, "").trim();
  if (!cypher) return { cypher, error: "查询为空" };
  if (WRITE_CLAUSE.test(cypher)) return { cypher, error: "只允许只读查询（MATCH / OPTIONAL MATCH / WITH / RETURN / ORDER BY / LIMIT）" };
  if (!/\bRETURN\b/i.test(cypher)) return { cypher, error: "查询需要 RETURN 子句" };
  cypher = cypher.replace(/;\s*$/, "");
  const limitMatch = cypher.match(/\bLIMIT\s+(\d+)\s*$/i);
  if (limitMatch) {
    if (Number(limitMatch[1]) > MAX_ROWS) cypher = cypher.replace(/\bLIMIT\s+\d+\s*$/i, `LIMIT ${MAX_ROWS}`);
  } else {
    cypher = `${cypher}\nLIMIT ${MAX_ROWS}`;
  }
  return { cypher };
}

async function runGraphQuery(rawCypher: string): Promise<{ result: unknown; citedClaims?: CitedClaim[] }> {
  const { cypher, error } = normalizeCypher(rawCypher);
  if (error) return { result: { error, cypher } };

  if (!getNeo4jDriver()) {
    return { result: { error: "图谱数据库未连接，请改用其他工具", cypher } };
  }

  const started = Date.now();
  let failure: string | null = null;
  const rows = await withNeo4jSession(async (session) => {
    try {
      const res = await session.executeRead((tx) => tx.run(cypher), { timeout: QUERY_TIMEOUT_MS });
      return res.records.map((rec) => mapValues(rec.toObject()));
    } catch (err) {
      failure = err instanceof Error ? err.message : String(err);
      return null;
    }
  });

  if (failure) return { result: { error: `Cypher 执行失败：${failure}`, cypher } };
  if (!rows) return { result: { error: "图谱数据库暂时不可用，请改用其他工具", cypher } };

  const citedClaims = collectClaims(rows);
  return {
    result: {
      cypher,
      rowCount: rows.length,
      truncated: rows.length >= MAX_ROWS,
      elapsedMs: Date.now() - started,
      rows,
      // How to cite the claims that came back, keyed by claim id.
      citeAs: citedClaims.length
        ? Object.fromEntries(citedClaims.map((c) => [c.id, `[#${c.sourceIndex} ${c.sourceTitle}]`]))
        : undefined,
    },
    citedClaims: citedClaims.length ? citedClaims : undefined,
  };
}

export async function executeAgentTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ result: unknown; citedClaims?: CitedClaim[] }> {
  switch (name) {
    case "query_graph": {
      const cypher = typeof args.cypher === "string" ? args.cypher : "";
      return runGraphQuery(cypher);
    }

    case "search_claims": {
      const q = typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
      const terms = q.split(/\s+/).filter(Boolean);
      const hit = (text?: string) => !!text && terms.some((t) => text.toLowerCase().includes(t));
      const type = typeof args.type === "string" ? args.type.trim().toUpperCase() : "";
      const context = typeof args.context === "string" ? args.context : undefined;
      const kind = typeof args.kind === "string" ? args.kind : undefined;
      const fnCode = typeof args.functionCode === "string" ? args.functionCode : undefined;
      const limit = Math.min(Math.max(typeof args.limit === "number" ? args.limit : 5, 1), 8);

      if (type && mbtiTypes.some((t) => t.type === type)) {
        // Query through claims service
        // Keyword matching is done here so multi-term queries work the same
        // way as in the cross-type path below.
        const res = await getClaimsForType({ type, context, kind, function: fnCode });
        const matched = res
          ? res.claims.filter(
              (c) => !terms.length || hit(c.statement) || hit(c.advice) || hit(c.boundary) || c.traits.some((t) => hit(t))
            )
          : [];
        if (res && matched.length > 0) {
          const picked = matched.slice(0, limit);
          const citedClaims: CitedClaim[] = picked.map((c) => ({
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
              totalFound: matched.length,
              returnedCount: picked.length,
              claims: picked.map((c) => ({
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
      if (terms.length) {
        pool = pool.filter(
          (c) =>
            hit(c.statement) ||
            hit(c.advice) ||
            hit(c.boundary) ||
            hit(c.example) ||
            (c.traits ?? []).some((t) => hit(t))
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
// System Prompts
// ---------------------------------------------------------------------------

export function getSystemPrompt(mode: "diagnose" | "consult"): string {
  const base = `你是 Frank MBTI 的聊天助手。背后是一个知识图谱：16 种类型的荣格八维与 Beebe 八槽位模型、136 组两两配对读法、1,251 条来自作者原声的观点，以及可以直接用 Cypher 查询的 Neo4j 图数据库。

怎么说话
- 直白、简短、具体。像一个懂行的朋友在聊天，不是在写报告。
- 一次只说一件事。要问就只问一个问题，问题要短，落在一个具体的日常场景上，让用户一两句话就能答。
- 不解释为什么这么问，不预告接下来要做什么，不复述用户刚说的话。
- 不夸用户，不说"好问题""很有意思""你的回答非常典型"。不安慰，不打气。
- 不用感叹号，不用 emoji，不用破折号。不用"不是……而是……"的句式。段落结尾不加一句总结性的话。
- 不堆标题和加粗。默认写短段落。只在给最终结论时可以用一个简短列表。
- 分析要落到具体的认知功能（Ni/Ne/Si/Se/Ti/Te/Fi/Fe）和槽位上，不说"内向的人不爱说话"这种话。
- 引用观点库时用 [#来源编号 来源标题] 标注，例如 [#524 诗人与刺客]。来源编号是 sourceIndex 的数字（观点 id c028-06 对应来源 28），不要把观点 id 写进去。只标真正用到的。
- 第三人称用 ta。

思考过程
每一条给用户的回复都必须以 <think> 块开头，调完工具之后的最终回复也一样，没有例外。块里写你的推理：目前掌握了什么（包括工具查到的要点），还不确定什么，下一步要确认什么，为什么选这个问题或这个查询。这一块会作为"思考过程"展示给用户，用中文，可以写长，但要是真实的推理，不写客套话，也不复述这些格式要求。</think> 之后才是正文，正文要短。格式：
<think>
……
</think>
正文

工具
- get_type_profile、get_pair_dynamics、get_cognitive_axis、search_claims 是现成的查询。
- query_graph 直接跑只读 Cypher，适合跨类型统计、多跳关系、按特质或外号反查、误判链条这类现成工具覆盖不到的问题。写查询前先看工具说明里的图谱结构，RETURN 的列用 AS 起短名字。查询失败就改写一次，再失败就换别的工具。
- 调了工具不等于要把结果全倒给用户。只用得上的部分。`;

  if (mode === "diagnose") {
    return `${base}

当前任务：帮用户判断类型
用户想弄清自己的类型，或者分辨两个相近的类型。

1. 开场只问一个问题。如果用户给了候选类型，先在 <think> 里列出这几个类型功能栈的差异（主导、辅助、劣势各是什么），挑一个最能区分的点来问。没给候选类型，就先问一个能区分判断功能（Ti/Te/Fi/Fe）或感知功能（Ni/Ne/Si/Se）的场景。
2. 场景要具体、日常，让用户回答"我会怎么做"或"第一反应是什么"。不给选项，或最多给两个。不一次问多个问题。
3. 用户答完后，用一两句话说你从这个回答里看到了哪个功能在起作用，然后直接问下一个问题。不把每个功能都解释一遍。
4. 一般问 4 到 6 轮。有把握了就直接给结论：类型，主导和劣势功能，哪几个回答支持这个判断，两三段话。还在两个类型之间摇摆就说清楚卡在哪，再问一个针对性的问题。
5. 需要档案或辨析依据时调工具或跑 Cypher。两个类型的辨析依据在 kind 为 mistype 的观点里：search_claims 带 kind: mistype，或用 query_graph 查同时 ABOUT 这两个类型且 kind = 'mistype' 的观点。

记住：回复以 <think> 开头，</think> 之后只写一两句话加一个问题。`;
  }

  return `${base}

当前任务：答疑
用户带着具体的困扰来：关系、职场、内耗、成长。

1. 如果情境不够具体（比如只给了两个类型没说发生了什么），先问一个问题把情境弄清，比如"你们最近卡在哪件具体的事上"。一次只问一个。
2. 情境清楚后先查图谱：get_pair_dynamics、get_type_profile、search_claims，或者用 query_graph 直接查。回答要落在查到的观点上，标注 [#编号 标题]。
3. 回答顺序：先一两句话说问题出在哪个功能上，再说该怎么做，具体到行为。最多三四段。不套"本质剖析 / 边界 / 解法"三段模板，除非用户明确要完整分析。
4. 回答完可以问一个跟进问题，不是必须的。

记住：回复以 <think> 开头，</think> 之后才是给用户看的正文。`;
}

// ---------------------------------------------------------------------------
// Offline fallback (no API key, or upstream down)
// ---------------------------------------------------------------------------

export async function generateOfflineHeuristicResponse(
  userQuery: string,
  mode: "diagnose" | "consult"
): Promise<{ text: string; citations: CitedClaim[] }> {
  const matches = userQuery.toUpperCase().match(/\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/g);
  const detectedTypes = matches ? Array.from(new Set(matches)) : [];
  const note = "\n\n*（当前是本地图谱模式。配置 Gemini API Key 后可以多轮追问。）*";

  let citations: CitedClaim[] = [];
  let text = "";

  if (mode === "diagnose") {
    if (detectedTypes.length >= 2) {
      const [t1, t2] = detectedTypes;
      const p1 = mbtiTypes.find((t) => t.type === t1);
      const p2 = mbtiTypes.find((t) => t.type === t2);
      const searchRes = await executeAgentTool("search_claims", { type: t1, query: "辨析", limit: 3 });
      citations = searchRes.citedClaims || [];

      text = `${t1} 的功能栈是 ${p1?.cognitiveFunctions}，${t2} 是 ${p2?.cognitiveFunctions}。主导功能不同，压力下的反应也不同。

先问一个：一个你准备了很久的计划突然被外力打乱，周围人都在慌。你的第一反应是什么？`;
    } else {
      const t = detectedTypes[0];
      const profile = t ? mbtiTypes.find((x) => x.type === t) : undefined;
      if (t) {
        const searchRes = await executeAgentTool("search_claims", { type: t, limit: 3 });
        citations = searchRes.citedClaims || [];
      }

      text = `${profile ? `你提到 ${t}（${profile.title}）。` : ""}先看一个场景。

一个关系一般的熟人在微信上找你借一笔不小的钱，说了一段很惨的经历。你关掉聊天框后，脑子里第一个念头是什么？`;
    }
  } else if (detectedTypes.length >= 2) {
    const [t1, t2] = detectedTypes;
    const pairRes = await executeAgentTool("get_pair_dynamics", { type1: t1, type2: t2 });
    const claimsRes = await executeAgentTool("search_claims", { type: t1, query: t2, limit: 4 });
    citations = claimsRes.citedClaims || [];

    interface PairDynamicsResult {
      relationName?: string;
      relationReading?: string;
      authorCanonicalMatch?: { cpName: string; score: number; description: string } | null;
    }
    const pairData = pairRes.result as PairDynamicsResult;
    text = `${t1} 和 ${t2} 在图谱里的对位是"${pairData.relationName || "两两互动"}"。${pairData.relationReading || ""}${
      pairData.authorCanonicalMatch
        ? `\n\n作者把这对叫"${pairData.authorCanonicalMatch.cpName}"，契合分 ${pairData.authorCanonicalMatch.score}。${pairData.authorCanonicalMatch.description}`
        : ""
    }

你们最近卡在哪件具体的事上？`;
  } else {
    const t = detectedTypes[0];
    const profile = t ? mbtiTypes.find((x) => x.type === t) : undefined;
    if (t) {
      const claimsRes = await executeAgentTool("search_claims", { type: t, query: userQuery, limit: 4 });
      citations = claimsRes.citedClaims || [];
    }

    if (profile) {
      text = `${t}（${profile.title}）的能量模型：${profile.energyModel}

${
  citations.length > 0
    ? citations.slice(0, 2).map((c) => `[#${c.sourceIndex} ${c.sourceTitle}] ${c.statement}`).join("\n\n")
    : "多数内耗是拿自己的第三、第四功能去迎合别人的主导功能。"
}

你现在具体是哪件事让你耗？`;
    } else {
      text = `先说说你的类型，或者具体发生了什么。`;
    }
  }

  return { text: text + note, citations };
}

// ---------------------------------------------------------------------------
// Stream events
// ---------------------------------------------------------------------------

export interface AgentStreamEvent {
  type: "tool_call" | "tool_result" | "text_delta" | "thought_delta" | "citation" | "done" | "error" | "engine";
  name?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  /** Short line describing what the tool returned, for the trace UI. */
  summary?: string;
  text?: string;
  citation?: CitedClaim;
  message?: string;
  engine?: "gemini" | "offline_graph";
  model?: string;
}

/**
 * Splits a streamed reply into the <think> block and the visible text.
 * Holds back just enough of the tail to avoid emitting a half tag.
 */
class ThoughtSplitter {
  private state: "start" | "thought" | "text" = "start";
  private buf = "";
  private thoughtStarted = false;
  private textStarted = false;

  /** Trims leading whitespace until the first real character of a section has gone out. */
  private lead(kind: "thought" | "text", s: string): string {
    const started = kind === "thought" ? this.thoughtStarted : this.textStarted;
    if (started) return s;
    const trimmed = s.replace(/^\s+/, "");
    if (!trimmed) return "";
    if (kind === "thought") this.thoughtStarted = true;
    else this.textStarted = true;
    return trimmed;
  }

  push(chunk: string): AgentStreamEvent[] {
    this.buf += chunk;
    const out: AgentStreamEvent[] = [];

    if (this.state === "start") {
      const lead = this.buf.trimStart();
      if (lead.startsWith("<think>")) {
        this.state = "thought";
        this.buf = lead.slice("<think>".length);
      } else if ("<think>".startsWith(lead) && lead.length < "<think>".length) {
        return out; // could still become a tag
      } else {
        this.state = "text";
      }
    }

    if (this.state === "thought") {
      const end = this.buf.indexOf("</think>");
      if (end >= 0) {
        const thought = this.lead("thought", this.buf.slice(0, end));
        if (thought) out.push({ type: "thought_delta", text: thought });
        this.buf = this.buf.slice(end + "</think>".length);
        this.state = "text";
      } else {
        // Keep a possible partial "</think>" tail unemitted.
        const hold = partialSuffix(this.buf, "</think>");
        const raw = this.buf.slice(0, this.buf.length - hold);
        const emit = this.lead("thought", raw);
        if (emit) out.push({ type: "thought_delta", text: emit });
        this.buf = this.buf.slice(raw.length);
        return out;
      }
    }

    if (this.state === "text" && this.buf) {
      const emit = this.lead("text", this.buf);
      if (emit) out.push({ type: "text_delta", text: emit });
      this.buf = "";
    }
    return out;
  }

  flush(): AgentStreamEvent[] {
    const kind = this.state === "thought" ? "thought" : "text";
    const emit = this.lead(kind, this.buf);
    this.buf = "";
    if (!emit) return [];
    return [{ type: kind === "thought" ? "thought_delta" : "text_delta", text: emit }];
  }
}

/** Length of the longest suffix of `s` that is a prefix of `tag`. */
function partialSuffix(s: string, tag: string): number {
  for (let n = Math.min(tag.length - 1, s.length); n > 0; n--) {
    if (s.endsWith(tag.slice(0, n))) return n;
  }
  return 0;
}

function summarizeToolResult(name: string, result: unknown): string {
  const r = (result ?? {}) as Record<string, unknown>;
  if (typeof r.error === "string") return `失败：${r.error}`;
  switch (name) {
    case "query_graph":
      return `${r.rowCount ?? 0} 行${r.truncated ? "（已截断）" : ""}`;
    case "search_claims": {
      const total = (r.totalFound ?? r.totalMatches) as number | undefined;
      const got = Array.isArray(r.claims) ? r.claims.length : Array.isArray(r.returned) ? r.returned.length : 0;
      return total !== undefined ? `命中 ${total} 条，取 ${got} 条` : `${got} 条`;
    }
    case "get_type_profile":
      return typeof r.title === "string" ? `${r.type} ${r.title}` : "已读取";
    case "get_pair_dynamics": {
      const m = r.authorCanonicalMatch as { cpName?: string; score?: number } | null;
      return m?.cpName ? `${r.relationName}，${m.cpName} ${m.score} 分` : String(r.relationName ?? "已读取");
    }
    case "get_cognitive_axis":
      return r.axis ? "找到功能轴" : r.functionDetail ? "找到功能说明" : "未找到";
    default:
      return "完成";
  }
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
// Gemini streaming with multi-model fallback
// ---------------------------------------------------------------------------

function isTransientError(err: unknown): boolean {
  const s = String(err);
  return (
    s.includes("503") ||
    s.includes("UNAVAILABLE") ||
    s.includes("high demand") ||
    s.includes("429") ||
    s.includes("RESOURCE_EXHAUSTED")
  );
}

/**
 * Opens a streaming generation, trying each candidate model in turn while the
 * failure is transient. Once a stream has started, errors propagate.
 */
async function openGeminiStream(
  ai: GoogleGenAI,
  params: { contents: Content[]; systemInstruction: string; preferredModel?: string; allowTools?: boolean }
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
        const stream = await ai.models.generateContentStream({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            ...(params.allowTools === false ? {} : { tools: [{ functionDeclarations: AGENT_TOOLS }] }),
          },
        });
        return { stream, model };
      } catch (err: unknown) {
        lastErr = err;
        if (!isTransientError(err)) throw err;
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  throw lastErr;
}

async function* streamOffline(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  mode: "diagnose" | "consult",
  notice?: string
): AsyncGenerator<AgentStreamEvent> {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const { text, citations } = await generateOfflineHeuristicResponse(lastUserMsg, mode);

  for (const c of citations) {
    yield { type: "citation", citation: c };
  }

  const fullText = notice ? text + notice : text;
  const chunkSize = 24;
  for (let i = 0; i < fullText.length; i += chunkSize) {
    yield { type: "text_delta", text: fullText.slice(i, i + chunkSize) };
    await new Promise((r) => setTimeout(r, 20));
  }
  yield { type: "done" };
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
    yield* streamOffline(messages, mode);
    return;
  }

  const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
  const systemInstruction = getSystemPrompt(mode);

  // Earlier assistant turns come back from the client without their <think>
  // block; the model only needs the visible text to continue.
  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const allCitedClaims: CitedClaim[] = [];
  let streamedAnything = false;

  try {
    // Tool round-trips before the model is made to answer with what it has.
    const maxToolTurns = 6;

    for (let turn = 0; turn <= maxToolTurns; turn++) {
      const finalTurn = turn === maxToolTurns;
      const { stream, model: usedModel } = await openGeminiStream(ai, {
        contents,
        systemInstruction,
        preferredModel: model,
        allowTools: !finalTurn,
      });

      if (turn === 0) yield { type: "engine", engine: "gemini", model: usedModel };

      // Everything the model produced this turn, kept verbatim (including
      // thought signatures) so the next turn sees a well-formed history.
      const modelParts: Part[] = [];
      const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
      const splitter = new ThoughtSplitter();

      for await (const chunk of stream) {
        const parts = chunk.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          modelParts.push(part);
          if (part.functionCall?.name) {
            functionCalls.push({
              name: part.functionCall.name,
              args: (part.functionCall.args ?? {}) as Record<string, unknown>,
            });
          } else if (part.text && !part.thought) {
            for (const ev of splitter.push(part.text)) {
              streamedAnything = true;
              yield ev;
            }
          }
        }
      }
      for (const ev of splitter.flush()) {
        streamedAnything = true;
        yield ev;
      }

      if (modelParts.length) contents.push({ role: "model", parts: modelParts });

      if (functionCalls.length === 0) {
        yield { type: "done" };
        return;
      }

      const functionResponseParts: Part[] = [];
      for (const fc of functionCalls) {
        yield { type: "tool_call", name: fc.name, args: fc.args };

        const execution = await executeAgentTool(fc.name, fc.args);

        for (const claim of execution.citedClaims ?? []) {
          if (!allCitedClaims.some((c) => c.id === claim.id)) {
            allCitedClaims.push(claim);
            yield { type: "citation", citation: claim };
          }
        }

        yield {
          type: "tool_result",
          name: fc.name,
          result: execution.result,
          summary: summarizeToolResult(fc.name, execution.result),
        };

        functionResponseParts.push({
          functionResponse: { name: fc.name, response: { result: execution.result } },
        });
      }

      contents.push({ role: "user", parts: functionResponseParts });
    }

    yield { type: "done" };
  } catch (err: unknown) {
    if (isTransientError(err) && !streamedAnything) {
      console.warn("Gemini upstream busy (503/429), serving graph-grounded response.");
      yield* streamOffline(
        messages,
        mode,
        "\n\n*（Gemini 暂时繁忙，这条回答来自本地图谱。）*"
      );
      return;
    }

    const message = err instanceof Error ? err.message : "Agent 处理失败，请检查 API Key 或网络设置";
    console.error("Gemini Agent Execution Error:", err);
    yield { type: "error", message };
  }
}
