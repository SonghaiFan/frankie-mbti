import { withNeo4jSession } from "@/lib/neo4j";
import { mbtiTypes, groups } from "@/data/core/mbti-data";
import vocab from "@/data/claims/vocab.json";
import sources from "@/data/claims/sources.json";
import { allClaims, type ClaimRecord } from "@/data/claims";

// ---------------------------------------------------------------------------
// The claim layer of the graph, read per type. Direct claims (ABOUT the type)
// come first; claims about a group the type belongs to follow, the smaller
// (more specific) group first. Facets are computed over the whole set so the
// UI can filter by context / kind without another round trip.
// ---------------------------------------------------------------------------

export type ClaimScope = "direct" | "group";

export interface ClaimItem {
  id: string;
  kind: string;
  kindName: string;
  statement: string;
  advice?: string;
  boundary?: string;
  scope: ClaimScope;
  /** Group code the claim reached this type through (scope = group). */
  via?: string;
  contexts: string[];
  traits: string[];
  functions: Array<{ code: string; evidence: string }>;
  sourceIndex: number;
  /** Source title, from sources.json. */
  sourceTitle?: string;
}

export interface Facet {
  name: string;
  count: number;
}

export interface TypeClaimsResponse {
  type: string;
  source: "neo4j" | "local_fallback";
  total: number;
  contexts: Facet[];
  kinds: Array<Facet & { code: string }>;
  /** Per cognitive function: claims grounded in it, and how many name it explicitly. */
  functions: Array<{ code: string; count: number; explicit: number }>;
  traits: Facet[];
  nicknames: Facet[];
  claims: ClaimItem[];
}

export interface ClaimsQuery {
  type: string;
  context?: string;
  kind?: string;
  /** Only claims GROUNDED_IN this function; explicit evidence sorts first. */
  function?: string;
  /** Case-insensitive substring over statement, traits and advice. */
  q?: string;
  limit?: number;
  offset?: number;
}

const TYPE_CODES = mbtiTypes.map((t) => t.type);
const KIND_NAME = new Map(vocab.kinds.map((k) => [k.code, k.name]));
const CONTEXT_ORDER = vocab.contexts.map((c) => c.name);
const FUNCTION_ORDER = ["Ni", "Ne", "Si", "Se", "Ti", "Te", "Fi", "Fe"];
const SOURCE_TITLE = new Map(sources.map((v) => [v.index, v.title]));

const GROUP_MEMBERS = new Map(groups.map((g) => [g.code, g.types]));

interface Loaded {
  claims: ClaimItem[];
  nicknames: Facet[];
}

// One process-wide cache per type; the claim layer only changes on migrate.
const cache = new Map<string, { at: number; source: TypeClaimsResponse["source"]; data: Loaded }>();
const CACHE_TTL = 10 * 60 * 1000;

async function loadFromGraph(code: string): Promise<Loaded | null> {
  return withNeo4jSession(async (session) => {
    const result = await session.run(
      `MATCH (t:Type {code: $code})
       CALL {
         WITH t
         MATCH (c:Claim)-[:ABOUT]->(t)
         // A claim only about this type outranks one that also names others.
         RETURN c, "direct" AS scope, null AS via,
                size([(c)-[:ABOUT]->(x) | x]) - 1 AS rank
         UNION
         WITH t
         MATCH (c:Claim)-[:ABOUT]->(g:Group)<-[:BELONGS_TO_GROUP]-(t)
         WHERE NOT (c)-[:ABOUT]->(t)
         RETURN c, "group" AS scope, g.code AS via,
                10 + size([(g)<-[:BELONGS_TO_GROUP]-(x:Type) | x]) AS rank
       }
       WITH c, scope, collect(via)[0] AS via, min(rank) AS rank
       OPTIONAL MATCH (c)-[:IN_CONTEXT]->(ctx:Context)
       OPTIONAL MATCH (c)-[:SHOWS_TRAIT]->(tr:Trait)
       OPTIONAL MATCH (c)-[gf:GROUNDED_IN]->(f:Function)
       RETURN c, scope, via, rank,
              collect(DISTINCT ctx.name) AS contexts,
              collect(DISTINCT tr.name) AS traits,
              collect(DISTINCT {code: f.code, evidence: gf.evidence}) AS functions
       ORDER BY rank, c.id`,
      { code }
    );
    if (!result.records.length) return null;

    const claims: ClaimItem[] = result.records.map((rec) => {
      const p = rec.get("c").properties;
      const functions = (rec.get("functions") as Array<{ code?: string; evidence?: string }>)
        .filter((f) => f && f.code)
        .map((f) => ({ code: String(f.code), evidence: String(f.evidence ?? "inferred") }));
      return {
        id: String(p.id),
        kind: String(p.kind),
        kindName: String(p.kindName ?? KIND_NAME.get(String(p.kind)) ?? p.kind),
        statement: String(p.statement),
        advice: p.advice ? String(p.advice) : undefined,
        boundary: p.boundary ? String(p.boundary) : undefined,
        scope: rec.get("scope") as ClaimScope,
        via: rec.get("via") ? String(rec.get("via")) : undefined,
        contexts: (rec.get("contexts") as string[]).filter(Boolean),
        traits: (rec.get("traits") as string[]).filter(Boolean),
        functions,
        sourceIndex: Number(p.sourceIndex),
        sourceTitle: SOURCE_TITLE.get(Number(p.sourceIndex)),
      };
    });

    const nick = await session.run(
      `MATCH (t:Type {code: $code})-[r:NICKNAMED]->(n:Nickname)
       RETURN n.name AS name, r.count AS count ORDER BY count DESC, name`,
      { code }
    );
    const nicknames = nick.records.map((r) => ({ name: String(r.get("name")), count: Number(r.get("count")) }));

    return { claims, nicknames };
  });
}

function loadLocal(code: string): Loaded {
  const toItem = (c: ClaimRecord, scope: ClaimScope, via?: string): ClaimItem => ({
    id: c.id,
    kind: c.kind,
    kindName: KIND_NAME.get(c.kind) ?? c.kind,
    statement: c.statement,
    advice: c.advice,
    boundary: c.boundary,
    scope,
    via,
    contexts: c.contexts ?? [],
    traits: c.traits ?? [],
    functions: c.functions ?? [],
    sourceIndex: c.sourceIndex,
    sourceTitle: SOURCE_TITLE.get(c.sourceIndex),
  });

  const ranked: Array<{ item: ClaimItem; rank: number }> = [];
  const nicknames = new Map<string, number>();
  for (const c of allClaims) {
    for (const a of c.aliases ?? []) if (a.type === code) nicknames.set(a.name, (nicknames.get(a.name) ?? 0) + 1);
    if (c.subjects.some((s) => s.kind === "Type" && s.key === code)) {
      ranked.push({ item: toItem(c, "direct"), rank: c.subjects.length - 1 });
      continue;
    }
    let best: { via: string; rank: number } | null = null;
    for (const s of c.subjects) {
      if (s.kind !== "Group") continue;
      const members = GROUP_MEMBERS.get(s.key) ?? [];
      if (!members.includes(code)) continue;
      if (!best || 10 + members.length < best.rank) best = { via: s.key, rank: 10 + members.length };
    }
    if (best) ranked.push({ item: toItem(c, "group", best.via), rank: best.rank });
  }
  ranked.sort((a, b) => a.rank - b.rank || a.item.id.localeCompare(b.item.id));
  return {
    claims: ranked.map((r) => r.item),
    nicknames: [...nicknames].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  };
}

async function loadType(code: string): Promise<{ source: TypeClaimsResponse["source"]; data: Loaded }> {
  const hit = cache.get(code);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit;
  const fromGraph = await loadFromGraph(code);
  const entry = fromGraph
    ? { at: Date.now(), source: "neo4j" as const, data: fromGraph }
    : { at: Date.now(), source: "local_fallback" as const, data: loadLocal(code) };
  cache.set(code, entry);
  return entry;
}

function facets(claims: ClaimItem[]) {
  const ctx = new Map<string, number>();
  const kinds = new Map<string, number>();
  const traits = new Map<string, number>();
  const fns = new Map<string, { count: number; explicit: number }>();
  for (const c of claims) {
    // A direct observation weighs more than one inherited through a group.
    const w = c.scope === "direct" ? 2 : 1;
    for (const name of c.contexts) ctx.set(name, (ctx.get(name) ?? 0) + 1);
    kinds.set(c.kind, (kinds.get(c.kind) ?? 0) + 1);
    for (const name of c.traits) traits.set(name, (traits.get(name) ?? 0) + w);
    for (const f of c.functions) {
      const cur = fns.get(f.code) ?? { count: 0, explicit: 0 };
      cur.count += 1;
      if (f.evidence === "explicit") cur.explicit += 1;
      fns.set(f.code, cur);
    }
  }
  return {
    contexts: CONTEXT_ORDER.filter((n) => ctx.has(n)).map((name) => ({ name, count: ctx.get(name)! })),
    kinds: vocab.kinds
      .filter((k) => kinds.has(k.code))
      .map((k) => ({ code: k.code, name: k.name, count: kinds.get(k.code)! })),
    functions: FUNCTION_ORDER.filter((code) => fns.has(code)).map((code) => ({ code, ...fns.get(code)! })),
    traits: [...traits]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh")),
  };
}

export async function getClaimsForType(query: ClaimsQuery): Promise<TypeClaimsResponse | null> {
  const code = query.type.toUpperCase();
  if (!TYPE_CODES.includes(code)) return null;

  const { source, data } = await loadType(code);
  const { contexts, kinds, functions, traits } = facets(data.claims);

  let filtered = data.claims;
  if (query.context) filtered = filtered.filter((c) => c.contexts.includes(query.context!));
  if (query.kind) filtered = filtered.filter((c) => c.kind === query.kind);
  if (query.q && query.q.trim()) {
    const q = query.q.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.statement.toLowerCase().includes(q) ||
        c.traits.some((t) => t.toLowerCase().includes(q)) ||
        (c.advice ?? "").toLowerCase().includes(q)
    );
  }
  if (query.function) {
    const fn = query.function;
    const explicit = (c: ClaimItem) => c.functions.some((f) => f.code === fn && f.evidence === "explicit");
    filtered = filtered
      .filter((c) => c.functions.some((f) => f.code === fn))
      .sort((a, b) => Number(explicit(b)) - Number(explicit(a)));
  }

  const offset = Math.max(0, query.offset ?? 0);
  const limit = query.limit === undefined ? filtered.length : Math.max(0, query.limit);

  return {
    type: code,
    source,
    total: filtered.length,
    contexts,
    kinds,
    functions,
    traits: traits.slice(0, 24),
    nicknames: data.nicknames,
    claims: filtered.slice(offset, offset + limit),
  };
}
