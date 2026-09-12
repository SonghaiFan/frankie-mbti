import { withNeo4jSession, getNeo4jDriver } from "@/lib/neo4j";
import { mbtiTypes, colorGroups } from "@/data/core/mbti-data";

export interface GraphNodePayload {
  id: string;
  label: "Type" | "Group" | "Function" | "Trait" | "Series" | "Insight" | "Letter" | "Dimension";
  name: string;
  color?: string;
  properties: Record<string, unknown>;
}

export interface GraphEdgePayload {
  id: string;
  source: string;
  target: string;
  relationship: string;
  properties?: Record<string, unknown>;
}

export interface SubgraphResponse {
  nodes: GraphNodePayload[];
  edges: GraphEdgePayload[];
  source: "neo4j" | "local_fallback";
}

export interface TypeRelationsResponse {
  type: string;
  title: string;
  nickname: string;
  letters: Array<{ letter: string; name: string; dimension: string; description: string; slot: number }>;
  groups: Array<{ code: string; name: string; category: string; description?: string; keywords?: string }>;
  beebeStack: Array<{ slot: number; code: string; name: string; role: string; cnRole: string; desc: string }>;
  dual: { code: string; title: string; nickname?: string; name: string; description?: string } | null;
  shadow: { code: string; title: string; nickname?: string; name: string; description?: string } | null;
  sharedDominant: { code: string; title: string; nickname?: string; name: string; description?: string } | null;
  quasiIdentical: { code: string; title: string; nickname?: string; name: string; description?: string } | null;
  pairDynamics: Array<{ partnerCode: string; partnerTitle: string; name: string; description?: string; roleA?: string; roleB?: string }>;
}

export interface GroupEntity {
  code: string;
  name: string;
  category: string;
  description?: string;
  trait?: string;
  keywords?: string;
  color?: string;
  types: string[];
}

export interface CognitiveFunctionEntity {
  code: string;
  name: string;
  orientation: string;
  domain: string;
  pairedWith?: string;
  axisName?: string;
  description?: string;
  heroTypes: string[];
  auxTypes: string[];
  tertTypes: string[];
  inferiorTypes: string[];
}

/**
 * Fetch the complete graph topology for a single MBTI type.
 * Uses CALL { WITH t ... } subqueries to prevent Cartesian product explosion.
 */
export async function getTypeGraphData(typeCode: string): Promise<SubgraphResponse> {
  const upperCode = typeCode.toUpperCase();

  const dbResult = await withNeo4jSession(async (session) => {
    const result = await session.run(
      `
      MATCH (t:Type {code: $code})
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:COMPOSED_OF]->(l:Letter)-[rd:BELONGS_TO_DIMENSION]->(d:Dimension)
        RETURN collect({letter: l, dim: d, rel: r, dimRel: rd}) AS letters
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:BELONGS_TO_GROUP]->(g:Group)
        RETURN collect({group: g, rel: r}) AS groups
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:HAS_FUNCTION_SLOT]->(f:Function)
        OPTIONAL MATCH (f)-[ra:PAIRED_AXIS]->(pf:Function)
        RETURN collect({func: f, rel: r, pairedFunc: pf, axisRel: ra}) AS beebeFuncs
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:DUAL_COMPLEMENT]->(o:Type)
        RETURN collect({type: o, rel: r}) AS duals
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:SHADOW_MIRROR]->(o:Type)
        RETURN collect({type: o, rel: r}) AS shadows
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:SHARED_DOMINANT]->(o:Type)
        RETURN collect({type: o, rel: r}) AS sharedDoms
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:QUASI_IDENTICAL]->(o:Type)
        RETURN collect({type: o, rel: r}) AS quasiIdents
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:PAIR_DYNAMIC]->(o:Type)
        RETURN collect({type: o, rel: r}) AS pairDynamics
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:COMPATIBLE_WITH]->(p:Type)
        RETURN collect({type: p, rel: r})[0..4] AS partners
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:HAS_TRAIT]->(tr:Trait)
        RETURN collect({trait: tr, rel: r})[0..15] AS traits
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:HAS_INSIGHT]->(ins:Insight)
        WITH ins, r ORDER BY coalesce(r.weight, 0) DESC, ins.sourceIndex
        RETURN collect({insight: ins, rel: r})[0..8] AS insights
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[rm:MISTYPES_AS]->(mType:Type)
        RETURN collect({type: mType, rel: rm}) AS mistypes
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[rh:HARBORS_INNER]->(hType:Type)
        RETURN collect({type: hType, rel: rh}) AS innerShadows
      }
      RETURN t, letters, groups, beebeFuncs, duals, shadows, sharedDoms, quasiIdents,
             pairDynamics, partners, traits, insights, mistypes, innerShadows
      `,
      { code: upperCode }
    );

    if (!result.records.length) return null;

    const record = result.records[0];
    const tNode = record.get("t")?.properties;
    if (!tNode) return null;

    const nodes: GraphNodePayload[] = [];
    const edges: GraphEdgePayload[] = [];

    const addNode = (node: GraphNodePayload) => {
      if (!nodes.some((n) => n.id === node.id)) {
        nodes.push(node);
      }
    };

    const addEdge = (edge: GraphEdgePayload) => {
      if (!edges.some((e) => e.id === edge.id)) {
        edges.push(edge);
      }
    };

    // 1. Central Type node
    addNode({
      id: `type:${tNode.code}`,
      label: "Type",
      name: `${tNode.code} ${tNode.title || ""}`,
      color: tNode.color,
      properties: tNode,
    });

    // 2. Letters and Dimensions (COMPOSED_OF & BELONGS_TO_DIMENSION)
    const rawLetters = record.get("letters") || [];
    for (const item of rawLetters) {
      if (!item?.letter) continue;
      const lProps = item.letter.properties;
      const lId = `letter:${lProps.code}`;
      addNode({
        id: lId,
        label: "Letter",
        name: `${lProps.code} (${lProps.name || ""})`,
        properties: lProps,
      });

      addEdge({
        id: `rel:${tNode.code}-COMPOSED_OF->${lProps.code}`,
        source: `type:${tNode.code}`,
        target: lId,
        relationship: "COMPOSED_OF",
        properties: item.rel?.properties || {},
      });

      if (item.dim) {
        const dProps = item.dim.properties;
        const dId = `dim:${dProps.name}`;
        addNode({
          id: dId,
          label: "Dimension",
          name: dProps.name,
          properties: dProps,
        });

        addEdge({
          id: `rel:${lProps.code}-DIM->${dProps.name}`,
          source: lId,
          target: dId,
          relationship: "BELONGS_TO_DIMENSION",
        });
      }
    }

    // 3. Groups (2-letter, 3-letter, temperaments)
    const rawGroups = record.get("groups") || [];
    for (const item of rawGroups) {
      if (!item?.group) continue;
      const gProps = item.group.properties;
      const gId = `group:${gProps.code}`;
      addNode({
        id: gId,
        label: "Group",
        name: `${gProps.name} (${gProps.code})`,
        color: gProps.color,
        properties: gProps,
      });

      addEdge({
        id: `rel:${tNode.code}-BELONGS_TO_GROUP->${gProps.code}`,
        source: `type:${tNode.code}`,
        target: gId,
        relationship: "BELONGS_TO_GROUP",
        properties: item.rel?.properties || {},
      });
    }

    // 4. Beebe 8-Functions (HAS_FUNCTION_SLOT)
    const rawFuncs = record.get("beebeFuncs") || [];
    for (const item of rawFuncs) {
      if (!item?.func) continue;
      const fProps = item.func.properties;
      const rProps = item.rel?.properties || {};
      const fId = `func:${fProps.code}`;

      addNode({
        id: fId,
        label: "Function",
        name: `${fProps.code} ${fProps.name || ""}`,
        properties: fProps,
      });

      addEdge({
        id: `rel:${tNode.code}-HAS_FUNCTION_SLOT->${fProps.code}`,
        source: `type:${tNode.code}`,
        target: fId,
        relationship: "HAS_FUNCTION_SLOT",
        properties: rProps,
      });

      // Backward-compatibility: also keep HAS_FUNCTION for primary 4 slots
      if (Number(rProps.slot) <= 4) {
        addEdge({
          id: `rel:${tNode.code}->${fProps.code}`,
          source: `type:${tNode.code}`,
          target: fId,
          relationship: "HAS_FUNCTION",
          properties: rProps,
        });
      }
    }

    // 5. Type-to-Type Dynamics
    const addTypeRelation = (
      list: Array<{ type: { properties: Record<string, unknown> }; rel: { properties: Record<string, unknown> } }>,
      relName: string
    ) => {
      for (const item of list) {
        if (!item?.type) continue;
        const oProps = item.type.properties;
        const oId = `type:${oProps.code}`;
        addNode({
          id: oId,
          label: "Type",
          name: `${oProps.code} ${oProps.title || ""}`,
          color: oProps.color as string | undefined,
          properties: oProps,
        });

        addEdge({
          id: `rel:${tNode.code}-${relName}->${oProps.code}`,
          source: `type:${tNode.code}`,
          target: oId,
          relationship: relName,
          properties: item.rel?.properties || {},
        });
      }
    };

    addTypeRelation(record.get("duals") || [], "DUAL_COMPLEMENT");
    addTypeRelation(record.get("shadows") || [], "SHADOW_MIRROR");
    addTypeRelation(record.get("sharedDoms") || [], "SHARED_DOMINANT");
    addTypeRelation(record.get("quasiIdents") || [], "QUASI_IDENTICAL");
    addTypeRelation(record.get("pairDynamics") || [], "PAIR_DYNAMIC");
    addTypeRelation(record.get("partners") || [], "COMPATIBLE_WITH");
    addTypeRelation(record.get("mistypes") || [], "MISTYPES_AS");
    addTypeRelation(record.get("innerShadows") || [], "HARBORS_INNER");

    // 6. Traits
    const rawTraits = record.get("traits") || [];
    for (const item of rawTraits) {
      if (!item?.trait) continue;
      const trProps = item.trait.properties;
      const trId = `trait:${trProps.name}`;
      addNode({
        id: trId,
        label: "Trait",
        name: trProps.name,
        properties: trProps,
      });

      addEdge({
        id: `rel:${tNode.code}->${trProps.name}`,
        source: `type:${tNode.code}`,
        target: trId,
        relationship: "HAS_TRAIT",
        properties: item.rel?.properties || {},
      });
    }

    // 7. Insights
    const rawInsights = record.get("insights") || [];
    for (const item of rawInsights) {
      if (!item?.insight) continue;
      const insProps = item.insight.properties;
      const insId = `insight:${insProps.id}`;
      addNode({
        id: insId,
        label: "Insight",
        name: insProps.title || "洞察",
        properties: insProps,
      });

      addEdge({
        id: `rel:${tNode.code}->${insProps.id}`,
        source: `type:${tNode.code}`,
        target: insId,
        relationship: "HAS_INSIGHT",
        properties: item.rel?.properties || {},
      });
    }

    return { nodes, edges, source: "neo4j" as const };
  });

  if (dbResult) return dbResult;

  // Fallback: build from local mbti-data.ts
  const localType = mbtiTypes.find((t) => t.type === upperCode);
  if (!localType) {
    return { nodes: [], edges: [], source: "local_fallback" };
  }

  const nodes: GraphNodePayload[] = [];
  const edges: GraphEdgePayload[] = [];

  nodes.push({
    id: `type:${localType.type}`,
    label: "Type",
    name: `${localType.type} ${localType.title}`,
    color: localType.color,
    properties: localType as unknown as Record<string, unknown>,
  });

  const localGroup = colorGroups.find((g) => g.name === localType.group);
  if (localGroup) {
    const gId = `group:${localGroup.code}`;
    nodes.push({
      id: gId,
      label: "Group",
      name: `${localGroup.name} (${localGroup.code})`,
      color: localGroup.color,
      properties: localGroup as unknown as Record<string, unknown>,
    });
    edges.push({
      id: `rel:${localType.type}->${localGroup.code}`,
      source: `type:${localType.type}`,
      target: gId,
      relationship: "BELONGS_TO",
    });
  }

  return { nodes, edges, source: "local_fallback" };
}

/**
 * Fetch structured inter-type relationships and cognitive architecture for an MBTI type.
 */
export async function getTypeRelations(typeCode: string): Promise<TypeRelationsResponse | null> {
  const upperCode = typeCode.toUpperCase();

  return await withNeo4jSession(async (session) => {
    const res = await session.run(
      `
      MATCH (t:Type {code: $code})
      CALL {
        WITH t
        MATCH (t)-[r:COMPOSED_OF]->(l:Letter)-[:BELONGS_TO_DIMENSION]->(d:Dimension)
        RETURN collect({letter: l.code, name: l.name, dimension: d.name, description: l.description, slot: r.slot}) AS letters
      }
      CALL {
        WITH t
        MATCH (t)-[r:BELONGS_TO_GROUP]->(g:Group)
        RETURN collect({code: g.code, name: g.name, category: g.category, description: g.description, keywords: g.keywords}) AS groups
      }
      CALL {
        WITH t
        MATCH (t)-[r:HAS_FUNCTION_SLOT]->(f:Function)
        RETURN collect({slot: r.slot, code: f.code, name: f.name, role: r.role, cnRole: r.cnRole, desc: r.desc}) AS beebeStack
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:DUAL_COMPLEMENT]->(d:Type)
        RETURN head(collect({code: d.code, title: d.title, nickname: d.nickname, name: r.name, description: r.description})) AS dual
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:SHADOW_MIRROR]->(s:Type)
        RETURN head(collect({code: s.code, title: s.title, nickname: s.nickname, name: r.name, description: r.description})) AS shadow
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:SHARED_DOMINANT]->(sd:Type)
        RETURN head(collect({code: sd.code, title: sd.title, nickname: sd.nickname, name: r.name, description: r.description})) AS sharedDominant
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:QUASI_IDENTICAL]->(q:Type)
        RETURN head(collect({code: q.code, title: q.title, nickname: q.nickname, name: r.name, description: r.description})) AS quasiIdentical
      }
      CALL {
        WITH t
        OPTIONAL MATCH (t)-[r:PAIR_DYNAMIC]->(p:Type)
        RETURN collect({partnerCode: p.code, partnerTitle: p.title, name: r.name, description: r.description, roleA: r.roleA, roleB: r.roleB}) AS pairDynamics
      }
      RETURN t.code AS type, t.title AS title, t.nickname AS nickname,
             letters, groups, beebeStack, dual, shadow, sharedDominant, quasiIdentical, pairDynamics
      `,
      { code: upperCode }
    );

    if (!res.records.length) return null;
    const rec = res.records[0];

    const beebe = (rec.get("beebeStack") || []) as Array<{
      slot: number | { low: number };
      code: string;
      name: string;
      role: string;
      cnRole: string;
      desc: string;
    }>;
    beebe.sort((a, b) => {
      const slotA = typeof a.slot === "object" ? a.slot.low : Number(a.slot);
      const slotB = typeof b.slot === "object" ? b.slot.low : Number(b.slot);
      return slotA - slotB;
    });

    const letters = (rec.get("letters") || []) as Array<{
      slot: number | { low: number };
      letter: string;
      name: string;
      dimension: string;
      description: string;
    }>;
    letters.sort((a, b) => {
      const slotA = typeof a.slot === "object" ? a.slot.low : Number(a.slot);
      const slotB = typeof b.slot === "object" ? b.slot.low : Number(b.slot);
      return slotA - slotB;
    });

    return {
      type: rec.get("type"),
      title: rec.get("title") || "",
      nickname: rec.get("nickname") || "",
      letters: letters.map((l) => ({
        ...l,
        slot: typeof l.slot === "object" ? l.slot.low : Number(l.slot),
      })),
      groups: rec.get("groups") || [],
      beebeStack: beebe.map((b) => ({
        ...b,
        slot: typeof b.slot === "object" ? b.slot.low : Number(b.slot),
      })),
      dual: rec.get("dual"),
      shadow: rec.get("shadow"),
      sharedDominant: rec.get("sharedDominant"),
      quasiIdentical: rec.get("quasiIdentical"),
      pairDynamics: rec.get("pairDynamics") || [],
    };
  });
}

/**
 * Fetch all 32 Groups (temperaments, 2-letter, 3-letter) with their member types.
 */
export async function getAllGroups(): Promise<GroupEntity[]> {
  const result = await withNeo4jSession(async (session) => {
    const res = await session.run(`
      MATCH (g:Group)
      OPTIONAL MATCH (t:Type)-[:BELONGS_TO_GROUP]->(g)
      RETURN g, collect(t.code) AS memberTypes
      ORDER BY g.category, g.code
    `);

    return res.records.map((r) => {
      const g = r.get("g").properties;
      return {
        code: g.code,
        name: g.name,
        category: g.category,
        description: g.description,
        trait: g.trait,
        keywords: g.keywords,
        color: g.color,
        types: (r.get("memberTypes") || []).filter(Boolean),
      };
    });
  });

  return result || [];
}

/**
 * Fetch Jungian 8 Cognitive Functions overview with paired axes and type slots.
 */
export async function getCognitiveFunctionsOverview(): Promise<CognitiveFunctionEntity[]> {
  const result = await withNeo4jSession(async (session) => {
    const res = await session.run(`
      MATCH (f:Function)
      OPTIONAL MATCH (f)-[ra:PAIRED_AXIS]->(pf:Function)
      OPTIONAL MATCH (t:Type)-[rs:HAS_FUNCTION_SLOT]->(f)
      WHERE rs.slot <= 4
      RETURN f, pf.code AS pairedWith, ra.name AS axisName,
             collect({type: t.code, slot: rs.slot}) AS typeSlots
      ORDER BY f.code
    `);

    return res.records.map((r) => {
      const f = r.get("f").properties;
      const typeSlots = (r.get("typeSlots") || []) as Array<{ type: string; slot: number | { low: number } }>;

      const filterBySlot = (targetSlot: number) =>
        typeSlots
          .filter((ts) => {
            const slot = typeof ts.slot === "object" ? ts.slot.low : Number(ts.slot);
            return slot === targetSlot;
          })
          .map((ts) => ts.type);

      return {
        code: f.code,
        name: f.name,
        orientation: f.orientation || (f.code.endsWith("e") ? "外倾 Extraverted" : "内倾 Introverted"),
        domain: f.domain || (f.code.startsWith("N") || f.code.startsWith("S") ? "感知功能 Perceiving" : "判断功能 Judging"),
        pairedWith: r.get("pairedWith"),
        axisName: r.get("axisName"),
        description: f.description,
        heroTypes: filterBySlot(1),
        auxTypes: filterBySlot(2),
        tertTypes: filterBySlot(3),
        inferiorTypes: filterBySlot(4),
      };
    });
  });

  return result || [];
}

export interface GraphStatsResponse {
  connected: boolean;
  source: "neo4j" | "local_fallback";
  serverAgent?: string;
  address?: string;
  nodes: number;
  relationships: number;
}

export async function getSystemGraphStats(): Promise<GraphStatsResponse> {
  const driver = getNeo4jDriver();
  if (!driver) {
    return {
      connected: false,
      source: "local_fallback",
      nodes: 0,
      relationships: 0,
    };
  }

  const dbResult = await withNeo4jSession(async (session) => {
    const serverInfo = await driver.getServerInfo();
    const result = await session.run(`
      MATCH (n)
      WITH count(n) AS nodes
      MATCH ()-[r]->()
      RETURN nodes, count(r) AS rels
    `);

    if (!result.records.length) return null;

    const rec = result.records[0];
    const nodes = Number(rec.get("nodes")) || 0;
    const rels = Number(rec.get("rels")) || 0;

    return {
      connected: true,
      source: "neo4j" as const,
      serverAgent: serverInfo.agent,
      address: serverInfo.address,
      nodes,
      relationships: rels,
    };
  });

  if (dbResult) return dbResult;

  return {
    connected: false,
    source: "local_fallback",
    nodes: 0,
    relationships: 0,
  };
}

/**
 * Fetch a global bird-eye view of all 16 MBTI Types, Groups, Duals, Shadows, and Pairs.
 */
export async function getGlobalGraphOverview(): Promise<SubgraphResponse> {
  const dbResult = await withNeo4jSession(async (session) => {
    const result = await session.run(`
      MATCH (t:Type)
      OPTIONAL MATCH (t)-[rg:BELONGS_TO_GROUP {category: 'temperament'}]->(g:Group)
      OPTIONAL MATCH (t)-[rd:DUAL_COMPLEMENT]->(dual:Type)
      OPTIONAL MATCH (t)-[rs:SHADOW_MIRROR]->(shadow:Type)
      OPTIONAL MATCH (t)-[rp:PAIR_DYNAMIC]->(pair:Type)
      OPTIONAL MATCH (t)-[rc:COMPATIBLE_WITH]->(partner:Type)
      RETURN t, rg, g,
             collect(DISTINCT {rel: rd, node: dual}) AS duals,
             collect(DISTINCT {rel: rs, node: shadow}) AS shadows,
             collect(DISTINCT {rel: rp, node: pair}) AS pairs,
             collect(DISTINCT {rel: rc, node: partner})[0..2] AS partners
    `);

    if (!result.records.length) return null;

    const nodes: GraphNodePayload[] = [];
    const edges: GraphEdgePayload[] = [];

    const addNode = (node: GraphNodePayload) => {
      if (!nodes.some((n) => n.id === node.id)) {
        nodes.push(node);
      }
    };

    const addEdge = (edge: GraphEdgePayload) => {
      if (!edges.some((e) => e.id === edge.id)) {
        edges.push(edge);
      }
    };

    colorGroups.forEach((g) => {
      addNode({
        id: `group:${g.code}`,
        label: "Group",
        name: `${g.name} (${g.code})`,
        color: g.color,
        properties: { ...g },
      });
    });

    for (const record of result.records) {
      const tNode = record.get("t")?.properties;
      const gNode = record.get("g")?.properties;
      if (!tNode) continue;

      addNode({
        id: `type:${tNode.code}`,
        label: "Type",
        name: `${tNode.code} ${tNode.title || ""}`,
        color: tNode.color,
        properties: tNode,
      });

      if (gNode) {
        addEdge({
          id: `rel:${tNode.code}->${gNode.code}`,
          source: `type:${tNode.code}`,
          target: `group:${gNode.code}`,
          relationship: "BELONGS_TO_GROUP",
        });
      }

      // Dual complements
      for (const d of record.get("duals") || []) {
        if (!d?.node) continue;
        const dCode = d.node.properties.code;
        addEdge({
          id: `rel:${tNode.code}-DUAL-${dCode}`,
          source: `type:${tNode.code}`,
          target: `type:${dCode}`,
          relationship: "DUAL_COMPLEMENT",
          properties: d.rel?.properties || {},
        });
      }

      // Shadow mirrors
      for (const s of record.get("shadows") || []) {
        if (!s?.node) continue;
        const sCode = s.node.properties.code;
        addEdge({
          id: `rel:${tNode.code}-SHADOW-${sCode}`,
          source: `type:${tNode.code}`,
          target: `type:${sCode}`,
          relationship: "SHADOW_MIRROR",
          properties: s.rel?.properties || {},
        });
      }

      // Author pair dynamics
      for (const p of record.get("pairs") || []) {
        if (!p?.node) continue;
        const pCode = p.node.properties.code;
        addEdge({
          id: `rel:${tNode.code}-PAIR-${pCode}`,
          source: `type:${tNode.code}`,
          target: `type:${pCode}`,
          relationship: "PAIR_DYNAMIC",
          properties: p.rel?.properties || {},
        });
      }

      // Compatible partners
      for (const p of record.get("partners") || []) {
        if (!p?.node) continue;
        const pCode = p.node.properties.code;
        addEdge({
          id: `rel:${tNode.code}-COMPATIBLE-${pCode}`,
          source: `type:${tNode.code}`,
          target: `type:${pCode}`,
          relationship: "COMPATIBLE_WITH",
        });
      }
    }

    return { nodes, edges, source: "neo4j" as const };
  });

  if (dbResult && dbResult.nodes.length > 0) return dbResult;

  const nodes: GraphNodePayload[] = [];
  const edges: GraphEdgePayload[] = [];
  colorGroups.forEach((g) => {
    nodes.push({
      id: `group:${g.code}`,
      label: "Group",
      name: `${g.name} (${g.code})`,
      color: g.color,
      properties: { ...g },
    });
  });
  mbtiTypes.forEach((t) => {
    nodes.push({
      id: `type:${t.type}`,
      label: "Type",
      name: `${t.type} ${t.title}`,
      color: t.color,
      properties: { ...t },
    });
    const g = colorGroups.find((cg) => cg.name === t.group);
    if (g) {
      edges.push({
        id: `rel:${t.type}->${g.code}`,
        source: `type:${t.type}`,
        target: `group:${g.code}`,
        relationship: "BELONGS_TO",
      });
    }
  });

  return { nodes, edges, source: "local_fallback" };
}
