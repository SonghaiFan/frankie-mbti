/**
 * Build the MBTI knowledge graph in Neo4j from the repo's data files.
 *
 *   node scripts/graph/migrate.mts            # idempotent upsert
 *   node scripts/graph/migrate.mts --reset    # wipe the database first (recommended for the first run)
 *   node scripts/graph/migrate.mts --dry-run  # validate the data files, touch nothing
 *   node scripts/graph/migrate.mts --verify   # only print the graph report / integrity checks
 *
 * Sources of truth (nothing else writes to the graph). Two sets of files:
 *
 *   core/  — everything the UI renders locally; also seeds the non-claim layer of the graph
 *     src/data/core/mbti-data.ts     16 Types, traits, cognitive functions, Jung match rules
 *     src/data/core/ontology.json    dimensions, letters, groups, type<->type relations, Beebe roles
 *     src/data/core/series.json      canonical Series list
 *     src/data/core/insights.json    540 curated Insights, one per video (sourceIndex) -> also :Source nodes
 *     public/mbti_pairing_labels_matrix_flat.json   16x16 pairing labels -> COMPATIBLE_WITH
 *
 *   claims/ — the knowledge layer; the UI reads it from the graph (local files are seed + fallback)
 *     src/data/claims/vocab.json     claim kinds + context vocabulary
 *     src/data/claims/batch-*.json   atomic Claims extracted from each source
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import type { Session } from "neo4j-driver";

import { createDriver, readJson, rootDir } from "./env.mts";
import { mbtiTypes, colorGroups, cognitiveFunctions, mbtiMatches } from "../../src/data/core/mbti-data.ts";

// ---------------------------------------------------------------------------
// Data shapes
// ---------------------------------------------------------------------------

interface Ontology {
  dimensions: Array<{ name: string; code: string; poleA: string; poleB: string; poleAName: string; poleBName: string; poleADesc: string; poleBDesc: string }>;
  letters: Array<{ code: string; name: string; nickname: string; definition: string; dimensionName: string; pole: string }>;
  groups: Array<{ code: string; name: string; type: string; category: string; color: string; keywords: string; description: string; vividMetaphor: string }>;
  functionAxes: Array<{ funcA: string; funcB: string; name: string; category: string; description: string }>;
  beebeRoles: Array<{ slot: number; role: string; cnRole: string; desc: string }>;
  typeRelations: Record<string, Array<{ a: string; b: string; name: string; description: string } & Record<string, string>>>;
  typeLore: Record<string, Array<{ a: string; b: string } & Record<string, string>>>;
}

interface SeriesDef {
  name: string;
  description: string;
}

interface InsightDef {
  id: string;
  sourceIndex: number;
  targets: string[];
  series: string;
  title: string;
  archetype?: string;
  analogy?: string;
  coreParadox?: string;
  energyMechanism?: string;
  quote?: string;
  cleanedText?: string;
  actionableAdvice?: string;
}

/** A video, as far as the graph needs to know it: its row number, title and tags. */
interface SourceRow {
  index: number;
  title: string;
  categories: string[];
}

interface Vocab {
  kinds: Array<{ code: string; name: string; description: string }>;
  contexts: Array<{ name: string; description: string }>;
}

interface ClaimDef {
  id: string;
  sourceIndex: number;
  kind: string;
  statement: string;
  subjects: Array<{ kind: "Type" | "Group"; key: string }>;
  functions?: Array<{ code: string; evidence: "explicit" | "contextual" | "inferred" }>;
  traits?: string[];
  contexts?: string[];
  example?: string;
  advice?: string;
  boundary?: string;
  /** Nicknames the author uses for a type in this claim (小狗, 紫老头, 药水...). */
  aliases?: Array<{ type: string; name: string }>;
}

interface ClaimBatch {
  batchId: string;
  claims: ClaimDef[];
}

interface PairingCell {
  type1: string;
  type2: string;
  label: string;
  score: number;
}

const TYPE_CODES = mbtiTypes.map((t) => t.type);
const LETTERS = ["E", "I", "S", "N", "T", "F", "J", "P"];

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

/** One :Source per insight; the transcripts themselves are not part of the graph. */
function sourcesFromInsights(insights: InsightDef[]): SourceRow[] {
  return insights
    .map((i) => ({ index: i.sourceIndex, title: i.title, categories: i.targets }))
    .sort((a, b) => a.index - b.index);
}

function loadClaimBatches(): ClaimDef[] {
  const dir = path.join(rootDir, "src/data/claims");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^batch-\d{3}\.json$/.test(f))
    .sort()
    .flatMap((f) => (JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as ClaimBatch).claims);
}

// ---------------------------------------------------------------------------
// Target resolution: an insight target is a Type code, a Group code, "ALL",
// or a letter pattern like "NP" / "IFJ" that expands to every matching type.
// ---------------------------------------------------------------------------

type Scope = "direct" | "group" | "pattern" | "all";
const SCOPE_WEIGHT: Record<Scope, number> = { direct: 3, group: 2, pattern: 1, all: 1 };

function typesMatchingLetters(pattern: string): string[] {
  const letters = pattern.split("").filter((c) => c !== "x");
  return TYPE_CODES.filter((code) => letters.every((l) => code.includes(l)));
}

function resolveTarget(tag: string, groupCodes: Set<string>): { scope: Scope; types: string[] } {
  if (TYPE_CODES.includes(tag)) return { scope: "direct", types: [tag] };
  if (tag === "ALL") return { scope: "all", types: TYPE_CODES };
  if (groupCodes.has(tag)) return { scope: "group", types: typesMatchingLetters(tag) };
  if (/^[EISNTFJPx]{2,3}$/.test(tag)) {
    const types = typesMatchingLetters(tag);
    if (types.length) return { scope: "pattern", types };
  }
  throw new Error(`Unresolvable insight target "${tag}"`);
}

// ---------------------------------------------------------------------------
// Validation (runs before any write)
// ---------------------------------------------------------------------------

function validate(ontology: Ontology, series: SeriesDef[], insights: InsightDef[], sources: SourceRow[], vocab: Vocab, claims: ClaimDef[]) {
  const problems: string[] = [];
  const seriesNames = new Set(series.map((s) => s.name));
  const groupCodes = new Set(ontology.groups.map((g) => g.code));
  const ids = new Set<string>();
  const sourceIdx = new Set<number>();

  for (const ins of insights) {
    if (ids.has(ins.id)) problems.push(`duplicate insight id ${ins.id}`);
    ids.add(ins.id);
    if (sourceIdx.has(ins.sourceIndex)) problems.push(`${ins.id}: duplicate sourceIndex ${ins.sourceIndex}`);
    sourceIdx.add(ins.sourceIndex);
    if (ins.sourceIndex < 1 || ins.sourceIndex > sources.length) problems.push(`${ins.id}: sourceIndex ${ins.sourceIndex} outside insights.json (${sources.length} sources)`);
    if (!seriesNames.has(ins.series)) problems.push(`${ins.id}: unknown series "${ins.series}"`);
    if (!ins.title) problems.push(`${ins.id}: missing title`);
    if (!ins.targets?.length) problems.push(`${ins.id}: no targets`);
    for (const tag of ins.targets ?? []) {
      try {
        resolveTarget(tag, groupCodes);
      } catch (e) {
        problems.push(`${ins.id}: ${(e as Error).message}`);
      }
    }
  }

  const letterCodes = new Set(ontology.letters.map((l) => l.code));
  for (const l of LETTERS) if (!letterCodes.has(l)) problems.push(`ontology.letters missing ${l}`);
  const dimNames = new Set(ontology.dimensions.map((d) => d.name));
  for (const l of ontology.letters) if (!dimNames.has(l.dimensionName)) problems.push(`letter ${l.code} references unknown dimension "${l.dimensionName}"`);

  const funcCodes = new Set(allFunctions().map((f) => f.code));
  for (const ax of ontology.functionAxes) {
    for (const f of [ax.funcA, ax.funcB]) if (!funcCodes.has(f)) problems.push(`functionAxes references unknown function ${f}`);
  }
  for (const [rel, pairs] of Object.entries({ ...ontology.typeRelations, ...ontology.typeLore })) {
    for (const p of pairs) {
      for (const code of [p.a, p.b]) if (!TYPE_CODES.includes(code)) problems.push(`${rel}: unknown type ${code}`);
    }
  }
  for (const t of mbtiTypes) {
    const stack = t.cognitiveFunctions.split(" ");
    if (stack.length !== 4 || stack.some((f) => !funcCodes.has(f))) problems.push(`${t.type}: bad cognitiveFunctions "${t.cognitiveFunctions}"`);
  }

  const kinds = new Set(vocab.kinds.map((k) => k.code));
  const contexts = new Set(vocab.contexts.map((c) => c.name));
  const claimIds = new Set<string>();
  for (const c of claims) {
    if (claimIds.has(c.id)) problems.push(`duplicate claim id ${c.id}`);
    claimIds.add(c.id);
    if (!Number.isInteger(c.sourceIndex) || c.sourceIndex < 1 || c.sourceIndex > sources.length) {
      problems.push(`${c.id}: sourceIndex ${c.sourceIndex} outside insights.json`);
    }
    if (!kinds.has(c.kind)) problems.push(`${c.id}: unknown kind "${c.kind}"`);
    if (!c.statement) problems.push(`${c.id}: missing statement`);
    if (!c.subjects?.length) problems.push(`${c.id}: no subjects`);
    for (const sub of c.subjects ?? []) {
      const ok = sub.kind === "Type" ? TYPE_CODES.includes(sub.key) : sub.kind === "Group" && groupCodes.has(sub.key);
      if (!ok) problems.push(`${c.id}: invalid subject ${sub.kind}:${sub.key}`);
    }
    for (const fn of c.functions ?? []) if (!funcCodes.has(fn.code)) problems.push(`${c.id}: unknown function ${fn.code}`);
    for (const ctx of c.contexts ?? []) if (!contexts.has(ctx)) problems.push(`${c.id}: unknown context "${ctx}"`);
    for (const alias of c.aliases ?? []) if (!TYPE_CODES.includes(alias.type)) problems.push(`${c.id}: alias for unknown type ${alias.type}`);
  }

  if (problems.length) {
    throw new Error(`Data validation failed:\n  - ${problems.join("\n  - ")}`);
  }
}

// ---------------------------------------------------------------------------
// Derived rows
// ---------------------------------------------------------------------------

function allFunctions() {
  const { judging, perceiving } = cognitiveFunctions.categories;
  const build = (axis: string, fns: Record<string, { name: string; description: string; definition: string; characteristics: string; training: string }>) =>
    Object.entries(fns).map(([code, f]) => ({
      code,
      axis,
      attitude: code.endsWith("i") ? "Introverted" : "Extraverted",
      name: f.name,
      description: f.description,
      definition: f.definition,
      characteristics: f.characteristics,
      training: f.training,
    }));
  return [...build("Judging", judging.functions), ...build("Perception", perceiving.functions)];
}

/** Beebe 8-slot stack: slots 5-8 are slots 1-4 with the attitude flipped. */
function beebeStack(cognitiveFunctionsStr: string): string[] {
  const top = cognitiveFunctionsStr.split(" ");
  const flip = (f: string) => f[0] + (f[1] === "i" ? "e" : "i");
  return [...top, ...top.map(flip)];
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

async function write(session: Session, cypher: string, params: Record<string, unknown> = {}) {
  await session.executeWrite((tx) => tx.run(cypher, params));
}

async function writeRows<T>(session: Session, cypher: string, rows: T[], chunk = 200) {
  for (let i = 0; i < rows.length; i += chunk) {
    await session.executeWrite((tx) => tx.run(cypher, { rows: rows.slice(i, i + chunk) }));
  }
}

async function readValue<T>(session: Session, cypher: string, key: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await session.executeRead((tx) => tx.run(cypher, params));
  return res.records[0]?.get(key) as T;
}

const CONSTRAINTS: Array<[string, string, string]> = [
  ["type_code_unique", "Type", "code"],
  ["group_code_unique", "Group", "code"],
  ["function_code_unique", "Function", "code"],
  ["letter_code_unique", "Letter", "code"],
  ["dimension_name_unique", "Dimension", "name"],
  ["trait_name_unique", "Trait", "name"],
  ["series_name_unique", "Series", "name"],
  ["insight_id_unique", "Insight", "id"],
  ["source_index_unique", "Source", "index"],
  ["claim_id_unique", "Claim", "id"],
  ["context_name_unique", "Context", "name"],
  ["nickname_name_unique", "Nickname", "name"],
];

const KNOWN_LABELS = new Set(CONSTRAINTS.map(([, label]) => label));

async function resetDatabase(session: Session) {
  const constraints = await session.executeRead((tx) => tx.run("SHOW CONSTRAINTS YIELD name"));
  for (const r of constraints.records) await write(session, `DROP CONSTRAINT \`${r.get("name")}\` IF EXISTS`);
  const indexes = await session.executeRead((tx) => tx.run("SHOW INDEXES YIELD name, type WHERE type <> 'LOOKUP' RETURN name"));
  for (const r of indexes.records) await write(session, `DROP INDEX \`${r.get("name")}\` IF EXISTS`);
  // Auto-commit query so CALL ... IN TRANSACTIONS is allowed.
  await session.run("MATCH (n) CALL { WITH n DETACH DELETE n } IN TRANSACTIONS OF 1000 ROWS");
}

// ---------------------------------------------------------------------------
// Ontology layer
// ---------------------------------------------------------------------------

async function loadOntology(session: Session, ontology: Ontology) {
  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (d:Dimension {name: row.name})
     SET d += row`,
    ontology.dimensions
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (l:Letter {code: row.code})
     SET l.name = row.name, l.nickname = row.nickname, l.definition = row.definition, l.pole = row.pole
     WITH l, row
     MATCH (d:Dimension {name: row.dimensionName})
     MERGE (l)-[:BELONGS_TO_DIMENSION]->(d)`,
    ontology.letters
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (f:Function {code: row.code})
     SET f += row`,
    allFunctions()
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (a:Function {code: row.funcA}), (b:Function {code: row.funcB})
     MERGE (a)-[r1:PAIRED_AXIS]->(b) SET r1.name = row.name, r1.category = row.category, r1.description = row.description
     MERGE (b)-[r2:PAIRED_AXIS]->(a) SET r2.name = row.name, r2.category = row.category, r2.description = row.description`,
    ontology.functionAxes
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (t:Type {code: row.code})
     SET t += row.props
     WITH t, row
     UNWIND row.letters AS letter
     MATCH (l:Letter {code: letter.code})
     MERGE (t)-[:COMPOSED_OF {slot: letter.slot}]->(l)`,
    mbtiTypes.map((t) => ({
      code: t.type,
      props: {
        title: t.title,
        nickname: t.nickname,
        slogan: t.slogan,
        color: t.color,
        group: t.group,
        group_des: t.group_des,
        image: t.image,
        archetype: t.archetype ?? null,
        coreParadox: t.coreParadox ?? null,
        vividAnalogy: t.vividAnalogy ?? null,
        energyModel: t.energyModel ?? null,
      },
      letters: t.type.split("").map((code, i) => ({ code, slot: i + 1 })),
    }))
  );

  // Groups: ontology list, enriched with the 4 colour-quadrant extras from mbti-data.
  const quadrant = new Map(colorGroups.map((g) => [g.code, g]));
  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (g:Group {code: row.code})
     SET g += row.props
     WITH g, row
     UNWIND row.members AS member
     MATCH (t:Type {code: member})
     MERGE (t)-[r:BELONGS_TO_GROUP]->(g)
     SET r.category = row.props.category, r.type = row.props.type`,
    ontology.groups.map((g) => {
      const q = quadrant.get(g.code);
      return {
        code: g.code,
        props: {
          name: g.name,
          type: g.type,
          category: g.category,
          color: g.color || "slate",
          keywords: g.keywords || "",
          description: g.description || "",
          vividMetaphor: g.vividMetaphor || "",
          nickname: q?.nickname ?? null,
          formula: q?.formula ?? null,
          trait: q?.trait ?? null,
        },
        members: typesMatchingLetters(g.code),
      };
    })
  );

  const roleBySlot = new Map(ontology.beebeRoles.map((r) => [r.slot, r]));
  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (t:Type {code: row.type}), (f:Function {code: row.func})
     MERGE (t)-[r:HAS_FUNCTION_SLOT {slot: row.slot}]->(f)
     SET r.role = row.role, r.cnRole = row.cnRole, r.desc = row.desc`,
    mbtiTypes.flatMap((t) =>
      beebeStack(t.cognitiveFunctions).map((func, i) => {
        const role = roleBySlot.get(i + 1);
        return { type: t.type, func, slot: i + 1, role: role?.role ?? null, cnRole: role?.cnRole ?? null, desc: role?.desc ?? null };
      })
    )
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (t:Type {code: row.type})
     MERGE (tr:Trait {name: row.name})
     SET tr.category = row.category
     MERGE (t)-[r:HAS_TRAIT]->(tr)
     SET r.category = row.category`,
    mbtiTypes.flatMap((t) => [
      ...t.strengths.map((name) => ({ type: t.type, name, category: "strength" })),
      ...t.weaknesses.map((name) => ({ type: t.type, name, category: "weakness" })),
      ...t.actualTraits.map((name) => ({ type: t.type, name, category: "actual" })),
      ...t.surfaceTraits.map((name) => ({ type: t.type, name, category: "surface" })),
    ])
  );

  // 16x16 pairing matrix + Jung structural match rules.
  const matrixPath = path.join(rootDir, "public/mbti_pairing_labels_matrix_flat.json");
  const matrix: PairingCell[] = fs.existsSync(matrixPath) ? JSON.parse(fs.readFileSync(matrixPath, "utf-8")) : [];
  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (a:Type {code: row.a}), (b:Type {code: row.b})
     MERGE (a)-[r:COMPATIBLE_WITH]->(b)
     SET r.score = row.score, r.label = row.label, r.matchType = row.matchType, r.description = row.description`,
    matrix.map((cell) => {
      const jung = mbtiMatches.find(
        (m) => (m.pair[0] === cell.type1 && m.pair[1] === cell.type2) || (m.pair[0] === cell.type2 && m.pair[1] === cell.type1)
      );
      return {
        a: cell.type1,
        b: cell.type2,
        score: cell.score,
        label: cell.label,
        matchType: jung?.matchType ?? "互补互动",
        description: jung?.description ?? "",
      };
    })
  );

  // Symmetric type<->type relations.
  for (const [rel, pairs] of Object.entries(ontology.typeRelations)) {
    await writeRows(
      session,
      `UNWIND $rows AS row
       MATCH (a:Type {code: row.a}), (b:Type {code: row.b})
       MERGE (a)-[r1:${rel}]->(b) SET r1 += row.props
       MERGE (b)-[r2:${rel}]->(a) SET r2 += row.props`,
      pairs.map(({ a, b, ...props }) => ({ a, b, props }))
    );
  }

  // Directional lore (mistypes, inner shadow types).
  for (const [rel, pairs] of Object.entries(ontology.typeLore)) {
    await writeRows(
      session,
      `UNWIND $rows AS row
       MATCH (a:Type {code: row.a}), (b:Type {code: row.b})
       MERGE (a)-[r:${rel}]->(b) SET r += row.props`,
      pairs.map(({ a, b, ...props }) => ({ a, b, props }))
    );
  }
}

// ---------------------------------------------------------------------------
// Content layer
// ---------------------------------------------------------------------------

async function loadContent(session: Session, ontology: Ontology, series: SeriesDef[], insights: InsightDef[], sources: SourceRow[]) {
  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (s:Series {name: row.name})
     SET s.description = row.description`,
    series
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (s:Source {index: row.index})
     SET s = row`,
    sources
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (i:Insight {id: row.id})
     SET i += row.props
     WITH i, row
     MATCH (s:Series {name: row.series})
     MERGE (i)-[:BELONGS_TO_SERIES]->(s)
     WITH i, row
     MATCH (src:Source {index: row.sourceIndex})
     MERGE (i)-[:DERIVED_FROM]->(src)`,
    insights.map((ins) => ({
      id: ins.id,
      series: ins.series,
      sourceIndex: ins.sourceIndex,
      props: {
        sourceIndex: ins.sourceIndex,
        title: ins.title,
        targets: ins.targets,
        archetype: ins.archetype ?? null,
        analogy: ins.analogy ?? null,
        coreParadox: ins.coreParadox ?? null,
        energyMechanism: ins.energyMechanism ?? null,
        quote: ins.quote ?? null,
        cleanedText: ins.cleanedText ?? null,
        actionableAdvice: ins.actionableAdvice ?? null,
      },
    })),
    100
  );

  // Type -> Insight links. A type reached through several targets keeps the strongest scope.
  const groupCodes = new Set(ontology.groups.map((g) => g.code));
  const typeLinks = new Map<string, { type: string; id: string; scope: Scope; weight: number; via: string }>();
  const groupLinks: Array<{ group: string; id: string }> = [];

  for (const ins of insights) {
    for (const tag of ins.targets) {
      const { scope, types } = resolveTarget(tag, groupCodes);
      if (scope === "group") groupLinks.push({ group: tag, id: ins.id });
      for (const type of types) {
        const key = `${type}|${ins.id}`;
        const existing = typeLinks.get(key);
        if (!existing || existing.weight < SCOPE_WEIGHT[scope]) {
          typeLinks.set(key, { type, id: ins.id, scope, weight: SCOPE_WEIGHT[scope], via: tag });
        }
      }
    }
  }

  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (t:Type {code: row.type}), (i:Insight {id: row.id})
     MERGE (t)-[r:HAS_INSIGHT]->(i)
     SET r.scope = row.scope, r.weight = row.weight, r.via = row.via`,
    [...typeLinks.values()],
    500
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (g:Group {code: row.group}), (i:Insight {id: row.id})
     MERGE (g)-[:HAS_INSIGHT]->(i)`,
    groupLinks,
    500
  );

  // Prune content that is no longer in the data files.
  await write(session, `MATCH (i:Insight) WHERE NOT i.id IN $ids DETACH DELETE i`, { ids: insights.map((i) => i.id) });
  await write(session, `MATCH (s:Source) WHERE s.index > $max DETACH DELETE s`, { max: sources.length });
  await write(session, `MATCH (s:Series) WHERE NOT (s)<-[:BELONGS_TO_SERIES]-() DETACH DELETE s`);
}

// ---------------------------------------------------------------------------
// Knowledge layer: atomic claims extracted from each source
// ---------------------------------------------------------------------------

async function loadClaims(session: Session, vocab: Vocab, claims: ClaimDef[]) {
  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (c:Context {name: row.name})
     SET c.description = row.description`,
    vocab.contexts
  );

  const kindName = new Map(vocab.kinds.map((k) => [k.code, k.name]));

  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (s:Source {index: row.sourceIndex})
     MERGE (c:Claim {id: row.id})
     SET c.kind = row.kind, c.kindName = row.kindName, c.statement = row.statement,
         c.example = row.example, c.advice = row.advice,
         c.boundary = row.boundary, c.sourceIndex = row.sourceIndex
     MERGE (c)-[:FROM_SOURCE]->(s)`,
    claims.map((c) => ({
      id: c.id,
      kind: c.kind,
      kindName: kindName.get(c.kind) ?? c.kind,
      statement: c.statement,
      example: c.example ?? null,
      advice: c.advice ?? null,
      boundary: c.boundary ?? null,
      sourceIndex: c.sourceIndex,
    }))
  );

  for (const label of ["Type", "Group"] as const) {
    await writeRows(
      session,
      `UNWIND $rows AS row
       MATCH (c:Claim {id: row.id}), (n:${label} {code: row.key})
       MERGE (c)-[:ABOUT]->(n)`,
      claims.flatMap((c) => c.subjects.filter((s) => s.kind === label).map((s) => ({ id: c.id, key: s.key }))),
      500
    );
  }

  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (c:Claim {id: row.id}), (f:Function {code: row.code})
     MERGE (c)-[r:GROUNDED_IN]->(f)
     SET r.evidence = row.evidence`,
    claims.flatMap((c) => (c.functions ?? []).map((f) => ({ id: c.id, code: f.code, evidence: f.evidence }))),
    500
  );

  // Traits observed in the source material live in the same Trait namespace as
  // mbti-data.ts traits; a brand-new one gets category "observed".
  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (c:Claim {id: row.id})
     MERGE (t:Trait {name: row.name})
     ON CREATE SET t.category = "observed"
     MERGE (c)-[:SHOWS_TRAIT]->(t)`,
    claims.flatMap((c) => (c.traits ?? []).map((name) => ({ id: c.id, name: name.trim() }))).filter((r) => r.name),
    500
  );

  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (c:Claim {id: row.id}), (ctx:Context {name: row.name})
     MERGE (c)-[:IN_CONTEXT]->(ctx)`,
    claims.flatMap((c) => (c.contexts ?? []).map((name) => ({ id: c.id, name }))),
    500
  );

  // Nicknames the author uses for a type (小狗, 紫老头, 药水...). Count = how many claims use it.
  const aliasCount = new Map<string, { type: string; name: string; count: number }>();
  for (const c of claims) {
    for (const a of c.aliases ?? []) {
      const key = `${a.type}|${a.name}`;
      const cur = aliasCount.get(key) ?? { type: a.type, name: a.name, count: 0 };
      cur.count += 1;
      aliasCount.set(key, cur);
    }
  }
  await write(session, `MATCH ()-[r:NICKNAMED]->() DELETE r`);
  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (t:Type {code: row.type})
     MERGE (n:Nickname {name: row.name})
     MERGE (t)-[r:NICKNAMED]->(n)
     SET r.count = row.count`,
    [...aliasCount.values()]
  );

  // Prune claims, and vocabulary nodes nothing points at any more.
  await write(session, `MATCH (c:Claim) WHERE NOT c.id IN $ids DETACH DELETE c`, { ids: claims.map((c) => c.id) });
  await write(session, `MATCH (n:Nickname) WHERE NOT (n)<-[:NICKNAMED]-() DETACH DELETE n`);
  await write(session, `MATCH (tr:Trait) WHERE NOT (tr)<-[:HAS_TRAIT|SHOWS_TRAIT]-() DETACH DELETE tr`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

async function report(session: Session) {
  const labels = await session.executeRead((tx) => tx.run("MATCH (n) UNWIND labels(n) AS l RETURN l, count(*) AS c ORDER BY c DESC"));
  console.log("\nNodes");
  for (const r of labels.records) {
    const tag = KNOWN_LABELS.has(r.get("l")) ? "" : "   <- not part of the schema, run with --reset to remove";
    console.log(`  ${String(r.get("l")).padEnd(12)} ${String(r.get("c")).padStart(5)}${tag}`);
  }

  const rels = await session.executeRead((tx) => tx.run("MATCH ()-[r]->() RETURN type(r) AS t, count(*) AS c ORDER BY c DESC"));
  console.log("\nRelationships");
  for (const r of rels.records) console.log(`  ${String(r.get("t")).padEnd(22)} ${String(r.get("c")).padStart(5)}`);

  const checks: Array<[string, string]> = [
    ["Insights without a Type link", "MATCH (i:Insight) WHERE NOT (:Type)-[:HAS_INSIGHT]->(i) RETURN count(i) AS c"],
    ["Insights without a Series", "MATCH (i:Insight) WHERE NOT (i)-[:BELONGS_TO_SERIES]->() RETURN count(i) AS c"],
    ["Insights without a Source", "MATCH (i:Insight) WHERE NOT (i)-[:DERIVED_FROM]->() RETURN count(i) AS c"],
    ["Sources without an Insight", "MATCH (s:Source) WHERE NOT (s)<-[:DERIVED_FROM]-() RETURN count(s) AS c"],
    ["Types without 8 function slots", "MATCH (t:Type) OPTIONAL MATCH (t)-[r:HAS_FUNCTION_SLOT]->() WITH t, count(r) AS n WHERE n <> 8 RETURN count(t) AS c"],
    ["Types without 4 letters", "MATCH (t:Type) OPTIONAL MATCH (t)-[r:COMPOSED_OF]->() WITH t, count(r) AS n WHERE n <> 4 RETURN count(t) AS c"],
    ["Traits not linked to anything", "MATCH (tr:Trait) WHERE NOT (tr)<-[:HAS_TRAIT|SHOWS_TRAIT]-() RETURN count(tr) AS c"],
    ["Claims without a subject", "MATCH (c:Claim) WHERE NOT (c)-[:ABOUT]->() RETURN count(c) AS c"],
  ];
  const covered = await readValue<number>(session, "MATCH (s:Source) WHERE (s)<-[:FROM_SOURCE]-(:Claim) RETURN count(s) AS c", "c");
  const total = await readValue<number>(session, "MATCH (s:Source) RETURN count(s) AS c", "c");
  console.log(`\nClaim coverage: ${covered}/${total} sources`);

  console.log("\nIntegrity");
  let failed = false;
  for (const [label, cypher] of checks) {
    const c = await readValue<number>(session, cypher, "c");
    if (c > 0) failed = true;
    console.log(`  ${c === 0 ? "ok  " : "FAIL"} ${label}: ${c}`);
  }
  return !failed;
}

// ---------------------------------------------------------------------------

async function main() {
  const { values: args } = parseArgs({
    options: {
      reset: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      verify: { type: "boolean", default: false },
    },
  });

  const ontology = readJson<Ontology>("src/data/core/ontology.json");
  const series = readJson<SeriesDef[]>("src/data/core/series.json");
  const insights = readJson<InsightDef[]>("src/data/core/insights.json");
  const sources = sourcesFromInsights(insights);
  const vocab = readJson<Vocab>("src/data/claims/vocab.json");
  const claims = loadClaimBatches();

  validate(ontology, series, insights, sources, vocab, claims);
  const claimedSources = new Set(claims.map((c) => c.sourceIndex)).size;
  console.log(`Data ok: ${sources.length} sources, ${insights.length} insights, ${series.length} series, ${ontology.groups.length} groups, ${TYPE_CODES.length} types, ${claims.length} claims over ${claimedSources} sources`);
  if (args["dry-run"]) return;

  const { driver, database } = createDriver();
  const session = driver.session({ database });
  try {
    if (args.verify) {
      if (!(await report(session))) process.exitCode = 1;
      return;
    }

    if (args.reset) {
      console.log("Resetting database...");
      await resetDatabase(session);
    }

    for (const [name, label, prop] of CONSTRAINTS) {
      await write(session, `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (n:${label}) REQUIRE n.${prop} IS UNIQUE`);
    }

    console.log("Loading ontology layer...");
    await loadOntology(session, ontology);
    console.log("Loading content layer...");
    await loadContent(session, ontology, series, insights, sources);
    console.log("Loading claim layer...");
    await loadClaims(session, vocab, claims);

    const ok = await report(session);
    if (!ok) {
      console.error("\nIntegrity checks failed.");
      process.exitCode = 1;
    }
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
