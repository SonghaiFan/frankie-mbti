import { withNeo4jSession, getNeo4jDriver } from "@/lib/neo4j";
import { mbtiTypes, colorGroups } from "@/data/mbti-data";
import type { MBTIType } from "@/types/mbti";

export interface GraphNodePayload {
  id: string;
  label: "Type" | "Group" | "Function" | "Trait" | "Series" | "Insight";
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

/**
 * Fetch the complete graph topology for a single MBTI type.
 */
export async function getTypeGraphData(typeCode: string): Promise<SubgraphResponse> {
  const upperCode = typeCode.toUpperCase();

  const dbResult = await withNeo4jSession(async (session) => {
    const result = await session.run(
      `
      MATCH (t:Type {code: $code})
      OPTIONAL MATCH (t)-[rg:BELONGS_TO]->(g:Group)
      OPTIONAL MATCH (t)-[rf:HAS_FUNCTION]->(f:Function)
      OPTIONAL MATCH (t)-[rt:HAS_TRAIT]->(tr:Trait)
      OPTIONAL MATCH (t)-[rc:COMPATIBLE_WITH]->(partner:Type)
      OPTIONAL MATCH (t)-[ri:HAS_INSIGHT]->(ins:Insight)
      OPTIONAL MATCH (t)-[rm:MISTYPES_AS]->(mType:Type)
      OPTIONAL MATCH (t)-[rh:HARBORS_INNER]->(hType:Type)
      RETURN t, rg, g,
             collect(DISTINCT {rel: rf, node: f}) AS functions,
             collect(DISTINCT {rel: rt, node: tr})[0..12] AS traits,
             collect(DISTINCT {rel: rc, node: partner})[0..4] AS partners,
             collect(DISTINCT {rel: ri, node: ins})[0..6] AS insights,
             collect(DISTINCT {rel: rm, node: mType}) AS mistypes,
             collect(DISTINCT {rel: rh, node: hType}) AS innerShadows
      `,
      { code: upperCode }
    );

    if (!result.records.length) return null;

    const record = result.records[0];
    const tNode = record.get("t")?.properties;
    if (!tNode) return null;

    const nodes: GraphNodePayload[] = [];
    const edges: GraphEdgePayload[] = [];

    // Main Type node
    nodes.push({
      id: `type:${tNode.code}`,
      label: "Type",
      name: `${tNode.code} ${tNode.title || ""}`,
      color: tNode.color,
      properties: tNode,
    });

    // Group
    const gNode = record.get("g")?.properties;
    if (gNode) {
      const gId = `group:${gNode.code}`;
      nodes.push({
        id: gId,
        label: "Group",
        name: `${gNode.name} (${gNode.code})`,
        color: gNode.color,
        properties: gNode,
      });
      edges.push({
        id: `rel:${tNode.code}->${gNode.code}`,
        source: `type:${tNode.code}`,
        target: gId,
        relationship: "BELONGS_TO",
      });
    }

    // Functions
    const funcs = record.get("functions") || [];
    for (const item of funcs) {
      if (!item?.node) continue;
      const fProps = item.node.properties;
      const rProps = item.rel?.properties || {};
      const fId = `func:${fProps.code}`;

      if (!nodes.some((n) => n.id === fId)) {
        nodes.push({
          id: fId,
          label: "Function",
          name: `${fProps.code} ${fProps.name || ""}`,
          properties: fProps,
        });
      }

      edges.push({
        id: `rel:${tNode.code}->${fProps.code}`,
        source: `type:${tNode.code}`,
        target: fId,
        relationship: "HAS_FUNCTION",
        properties: rProps,
      });
    }

    // Insights
    const insights = record.get("insights") || [];
    for (const item of insights) {
      if (!item?.node) continue;
      const insProps = item.node.properties;
      const insId = `insight:${insProps.id}`;

      if (!nodes.some((n) => n.id === insId)) {
        nodes.push({
          id: insId,
          label: "Insight",
          name: insProps.title || "洞察",
          properties: insProps,
        });
      }

      edges.push({
        id: `rel:${tNode.code}->${insProps.id}`,
        source: `type:${tNode.code}`,
        target: insId,
        relationship: "HAS_INSIGHT",
      });
    }

    // Mistypes
    const mistypes = record.get("mistypes") || [];
    for (const item of mistypes) {
      if (!item?.node) continue;
      const mProps = item.node.properties;
      const mId = `type:${mProps.code}`;

      if (!nodes.some((n) => n.id === mId)) {
        nodes.push({
          id: mId,
          label: "Type",
          name: `${mProps.code} ${mProps.title || ""}`,
          color: mProps.color,
          properties: mProps,
        });
      }

      edges.push({
        id: `rel:${tNode.code}-mistypes->${mProps.code}`,
        source: `type:${tNode.code}`,
        target: mId,
        relationship: "MISTYPES_AS",
        properties: item.rel?.properties || {},
      });
    }

    // Inner Shadows
    const shadows = record.get("innerShadows") || [];
    for (const item of shadows) {
      if (!item?.node) continue;
      const sProps = item.node.properties;
      const sId = `type:${sProps.code}`;

      if (!nodes.some((n) => n.id === sId)) {
        nodes.push({
          id: sId,
          label: "Type",
          name: `${sProps.code} ${sProps.title || ""}`,
          color: sProps.color,
          properties: sProps,
        });
      }

      edges.push({
        id: `rel:${tNode.code}-shadow->${sProps.code}`,
        source: `type:${tNode.code}`,
        target: sId,
        relationship: "HARBORS_INNER",
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

export interface TypesResponse {
  data: MBTIType[];
  source: "neo4j" | "local_fallback";
  total: number;
}

export async function getAllTypesFromGraph(): Promise<TypesResponse> {
  const dbResult = await withNeo4jSession(async (session) => {
    const result = await session.run(`
      MATCH (t:Type)
      OPTIONAL MATCH (t)-[rf:HAS_FUNCTION]->(f:Function)
      OPTIONAL MATCH (t)-[rt:HAS_TRAIT]->(tr:Trait)
      OPTIONAL MATCH (t)-[rc:COMPATIBLE_WITH]->(partner:Type)
      WHERE rc.score IS NULL OR rc.score >= 85
      RETURN t,
             collect(DISTINCT {slot: rf.slot, code: f.code}) AS functions,
             collect(DISTINCT {category: rt.category, name: tr.name}) AS traits,
             collect(DISTINCT partner.code) AS bestPartners
      ORDER BY t.code
    `);

    if (!result.records.length) return null;

    const types: MBTIType[] = result.records.map((rec) => {
      const p = rec.get("t").properties;
      const rawFuncs = (rec.get("functions") || []) as Array<{ slot?: number; code?: string }>;
      const rawTraits = (rec.get("traits") || []) as Array<{ category?: string; name?: string }>;
      const rawPartners = (rec.get("bestPartners") || []) as string[];

      const validFuncs = rawFuncs.filter((item) => item && item.code);
      validFuncs.sort((a, b) => (Number(a.slot) || 0) - (Number(b.slot) || 0));
      const cogFunctions =
        validFuncs.length > 0
          ? validFuncs.map((f) => f.code).join(" ")
          : String(p.cognitiveFunctions || "");

      const getTraits = (cat: string) =>
        rawTraits.filter((tr) => tr && tr.category === cat && tr.name).map((tr) => String(tr.name));

      const strengths = getTraits("strength");
      const weaknesses = getTraits("weakness");
      const actualTraits = getTraits("actual");
      const surfaceTraits = getTraits("surface");
      const bestPartners = rawPartners.filter(Boolean);

      return {
        type: String(p.code || p.type || ""),
        title: String(p.title || ""),
        nickname: String(p.nickname || ""),
        archetype: p.archetype ? String(p.archetype) : undefined,
        coreParadox: p.coreParadox ? String(p.coreParadox) : undefined,
        vividAnalogy: p.vividAnalogy ? String(p.vividAnalogy) : undefined,
        energyModel: p.energyModel ? String(p.energyModel) : undefined,
        slogan: String(p.slogan || ""),
        color: String(p.color || "purple"),
        group: String(p.group || ""),
        group_des: String(p.traits || p.group_des || ""),
        image: String(p.image || `${p.code}.svg`),
        strengths: strengths.length > 0 ? strengths : (Array.isArray(p.strengths) ? p.strengths.map(String) : []),
        weaknesses: weaknesses.length > 0 ? weaknesses : (Array.isArray(p.weaknesses) ? p.weaknesses.map(String) : []),
        surfaceTraits: surfaceTraits.length > 0 ? surfaceTraits : (Array.isArray(p.surfaceTraits) ? p.surfaceTraits.map(String) : []),
        actualTraits: actualTraits.length > 0 ? actualTraits : (Array.isArray(p.actualTraits) ? p.actualTraits.map(String) : []),
        bestPartners: bestPartners.length > 0 ? bestPartners : (Array.isArray(p.bestPartners) ? p.bestPartners.map(String) : []),
        cognitiveFunctions: cogFunctions,
      };
    });

    return {
      data: types,
      source: "neo4j" as const,
      total: types.length,
    };
  });

  if (dbResult && dbResult.data.length > 0) {
    return dbResult;
  }

  return {
    data: mbtiTypes,
    source: "local_fallback",
    total: mbtiTypes.length,
  };
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
 * Fetch a global bird-eye view of all 16 MBTI Types, Groups, and primary partnerships.
 */
export async function getGlobalGraphOverview(): Promise<SubgraphResponse> {
  const dbResult = await withNeo4jSession(async (session) => {
    const result = await session.run(`
      MATCH (t:Type)-[rg:BELONGS_TO]->(g:Group)
      OPTIONAL MATCH (t)-[rc:COMPATIBLE_WITH]->(partner:Type)
      RETURN t, rg, g, collect(DISTINCT {rel: rc, node: partner})[0..2] AS partners
    `);

    if (!result.records.length) return null;

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

    for (const record of result.records) {
      const tNode = record.get("t")?.properties;
      const gNode = record.get("g")?.properties;
      if (!tNode) continue;

      nodes.push({
        id: `type:${tNode.code}`,
        label: "Type",
        name: `${tNode.code} ${tNode.title || ""}`,
        color: tNode.color,
        properties: tNode,
      });

      if (gNode) {
        edges.push({
          id: `rel:${tNode.code}->${gNode.code}`,
          source: `type:${tNode.code}`,
          target: `group:${gNode.code}`,
          relationship: "BELONGS_TO",
        });
      }

      const partners = record.get("partners") || [];
      for (const p of partners) {
        if (!p?.node) continue;
        const pCode = p.node.properties.code;
        edges.push({
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

