/**
 * Build the MBTI knowledge graph in Neo4j from the repo's data files.
 *
 *   node scripts/graph/migrate.mts            # idempotent upsert
 *   node scripts/graph/migrate.mts --reset    # wipe the database first (recommended for the first run)
 *   node scripts/graph/migrate.mts --dry-run  # validate the data files, touch nothing
 *   node scripts/graph/migrate.mts --verify   # only print the graph report / integrity checks
 *
 * One ground truth, two files:
 *
 *   src/data/core/mbti-data.ts     16 Types, 32 Groups, 8 Functions (+ 8 Beebe slots, 4 axes),
 *                                  dimensions/letters, pair readings, type lore
 *
 *   src/data/claims/sources.json   where the claims come from -> :Source nodes (index, title)
 *   src/data/claims/vocab.json     claim kinds + context vocabulary
 *   src/data/claims/batch-*.json   atomic Claims, each pointing at a source (the knowledge layer)
 *
 * Node labels: Dimension, Letter, Group, Function, Type, Trait, Source, Context, Claim, Nickname.
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import type { Session } from "neo4j-driver";

import { createDriver, readJson, rootDir } from "./env.mts";
import {
  mbtiTypes,
  groups,
  cognitiveFunctions,
  dimensions,
  mbtiMatches,
  pairRelations,
  relationOf,
  typeLore,
} from "../../src/data/core/mbti-data.ts";

// ---------------------------------------------------------------------------
// Data shapes
// ---------------------------------------------------------------------------

interface SourceRow {
  index: number;
  title: string;
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

const TYPE_CODES = mbtiTypes.map((t) => t.type);
const GROUP_CODES = new Set(groups.map((g) => g.code));

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

function loadClaimBatches(): ClaimDef[] {
  const dir = path.join(rootDir, "src/data/claims");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^batch-\d{3}\.json$/.test(f))
    .sort()
    .flatMap((f) => (JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as ClaimBatch).claims);
}

/** The eight functions as flat rows, each knowing which axis it sits on. */
function allFunctions() {
  const { judging, perceiving } = cognitiveFunctions.categories;
  const axisOf = new Map<string, string>();
  for (const ax of cognitiveFunctions.axes) {
    axisOf.set(ax.a, ax.name);
    axisOf.set(ax.b, ax.name);
  }
  const build = (axis: string, fns: Record<string, { name: string; description: string; definition: string; characteristics: string; training: string; atFront: string; atBottom: string }>) =>
    Object.entries(fns).map(([code, f]) => ({
      code,
      axis,
      attitude: code.endsWith("i") ? "Introverted" : "Extraverted",
      pairedAxis: axisOf.get(code) ?? null,
      name: f.name,
      description: f.description,
      definition: f.definition,
      characteristics: f.characteristics,
      training: f.training,
      atFront: f.atFront,
      atBottom: f.atBottom,
    }));
  return [...build("Judging", judging.functions), ...build("Perceiving", perceiving.functions)];
}

/** Beebe 8-slot stack: slots 5-8 are slots 1-4 with the attitude flipped. */
function beebeStack(stack: string): string[] {
  const top = stack.split(" ");
  const flip = (f: string) => f[0] + (f[1] === "i" ? "e" : "i");
  return [...top, ...top.map(flip)];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(sources: SourceRow[], vocab: Vocab, claims: ClaimDef[]) {
  const problems: string[] = [];
  const funcCodes = new Set(allFunctions().map((f) => f.code));

  for (const t of mbtiTypes) {
    const stack = t.cognitiveFunctions.split(" ");
    if (stack.length !== 4 || stack.some((f) => !funcCodes.has(f))) problems.push(`${t.type}: bad cognitiveFunctions "${t.cognitiveFunctions}"`);
    if (!groups.some((g) => g.category === "temperament" && g.name === t.group)) problems.push(`${t.type}: group "${t.group}" is not a temperament`);
  }
  for (const g of groups) if (!g.types.length) problems.push(`group ${g.code} matches no type`);
  for (const m of mbtiMatches) {
    for (const code of m.pair) if (!TYPE_CODES.includes(code)) problems.push(`match ${m.name}: unknown type ${code}`);
    if (m.score < 0 || m.score > 100) problems.push(`match ${m.name}: score ${m.score} out of range`);
  }
  for (const l of typeLore.mistypesAs) for (const code of [l.type, l.as]) if (!TYPE_CODES.includes(code)) problems.push(`mistypesAs: unknown type ${code}`);
  for (const l of typeLore.harborsInner) for (const code of [l.type, l.inner]) if (!TYPE_CODES.includes(code)) problems.push(`harborsInner: unknown type ${code}`);

  const indexes = new Set<number>();
  for (const s of sources) {
    if (indexes.has(s.index)) problems.push(`sources: duplicate index ${s.index}`);
    indexes.add(s.index);
    if (!s.title) problems.push(`sources: #${s.index} has no title`);
  }

  const kinds = new Set(vocab.kinds.map((k) => k.code));
  const contexts = new Set(vocab.contexts.map((c) => c.name));
  const claimIds = new Set<string>();
  for (const c of claims) {
    if (claimIds.has(c.id)) problems.push(`duplicate claim id ${c.id}`);
    claimIds.add(c.id);
    if (!indexes.has(c.sourceIndex)) problems.push(`${c.id}: sourceIndex ${c.sourceIndex} is not in sources.json`);
    if (!kinds.has(c.kind)) problems.push(`${c.id}: unknown kind "${c.kind}"`);
    if (!c.statement) problems.push(`${c.id}: missing statement`);
    if (!c.subjects?.length) problems.push(`${c.id}: no subjects`);
    for (const sub of c.subjects ?? []) {
      const ok = sub.kind === "Type" ? TYPE_CODES.includes(sub.key) : sub.kind === "Group" && GROUP_CODES.has(sub.key);
      if (!ok) problems.push(`${c.id}: invalid subject ${sub.kind}:${sub.key}`);
    }
    for (const fn of c.functions ?? []) if (!funcCodes.has(fn.code)) problems.push(`${c.id}: unknown function ${fn.code}`);
    for (const ctx of c.contexts ?? []) if (!contexts.has(ctx)) problems.push(`${c.id}: unknown context "${ctx}"`);
    for (const alias of c.aliases ?? []) if (!TYPE_CODES.includes(alias.type)) problems.push(`${c.id}: alias for unknown type ${alias.type}`);
  }

  if (problems.length) throw new Error(`Data validation failed:\n  - ${problems.join("\n  - ")}`);
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
  ["source_index_unique", "Source", "index"],
  ["claim_id_unique", "Claim", "id"],
  ["context_name_unique", "Context", "name"],
  ["nickname_name_unique", "Nickname", "name"],
];

async function resetDatabase(session: Session) {
  const constraints = await session.executeRead((tx) => tx.run("SHOW CONSTRAINTS YIELD name"));
  for (const r of constraints.records) await write(session, `DROP CONSTRAINT \`${r.get("name")}\` IF EXISTS`);
  const indexes = await session.executeRead((tx) => tx.run("SHOW INDEXES YIELD name, type WHERE type <> 'LOOKUP' RETURN name"));
  for (const r of indexes.records) await write(session, `DROP INDEX \`${r.get("name")}\` IF EXISTS`);
  // Auto-commit query so CALL ... IN TRANSACTIONS is allowed.
  await session.run("MATCH (n) CALL { WITH n DETACH DELETE n } IN TRANSACTIONS OF 1000 ROWS");
}

// ---------------------------------------------------------------------------
// Core layer: everything mbti-data.ts knows
// ---------------------------------------------------------------------------

async function loadCore(session: Session) {
  for (const [name, label, prop] of CONSTRAINTS) {
    await write(session, `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (n:${label}) REQUIRE n.${prop} IS UNIQUE`);
  }

  // Dimensions and their two letters.
  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (d:Dimension {name: row.name})
     SET d.code = row.code`,
    dimensions.map((d) => ({ name: d.name, code: d.options.map((o) => o.type).join("") }))
  );
  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (l:Letter {code: row.code})
     SET l.name = row.name, l.description = row.description, l.mnemonic = row.mnemonic
     WITH l, row
     MATCH (d:Dimension {name: row.dimension})
     MERGE (l)-[:BELONGS_TO_DIMENSION]->(d)`,
    dimensions.flatMap((d) => d.options.map((o) => ({ code: o.type, name: o.name, description: o.description, mnemonic: o.mnemonic, dimension: d.name })))
  );

  // Functions and their opposing axes.
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
     MATCH (a:Function {code: row.a}), (b:Function {code: row.b})
     MERGE (a)-[r1:PAIRED_AXIS]->(b) SET r1.name = row.name, r1.category = row.category, r1.description = row.description
     MERGE (b)-[r2:PAIRED_AXIS]->(a) SET r2.name = row.name, r2.category = row.category, r2.description = row.description`,
    cognitiveFunctions.axes
  );

  // Types: properties, letters, Beebe stack, traits.
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
        cognitiveFunctions: t.cognitiveFunctions,
        bestPartners: t.bestPartners,
      },
      letters: t.type.split("").map((code, i) => ({ code, slot: i + 1 })),
    }))
  );
  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (t:Type {code: row.type}), (f:Function {code: row.func})
     MERGE (t)-[r:HAS_FUNCTION_SLOT {slot: row.slot}]->(f)
     SET r.role = row.role, r.cnRole = row.cnRole`,
    mbtiTypes.flatMap((t) =>
      beebeStack(t.cognitiveFunctions).map((func, i) => ({
        type: t.type,
        func,
        slot: i + 1,
        role: cognitiveFunctions.levels[i].role,
        cnRole: cognitiveFunctions.levels[i].cnRole,
      }))
    )
  );
  await write(session, `MATCH ()-[r:HAS_TRAIT]->() DELETE r`);
  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (t:Type {code: row.type})
     MERGE (tr:Trait {name: row.name})
     ON CREATE SET tr.category = row.category
     MERGE (t)-[r:HAS_TRAIT]->(tr)
     SET r.category = row.category`,
    mbtiTypes.flatMap((t) =>
      (
        [
          ["strength", t.strengths],
          ["weakness", t.weaknesses],
          ["surface", t.surfaceTraits],
          ["actual", t.actualTraits],
        ] as const
      ).flatMap(([category, names]) => names.map((name) => ({ type: t.type, category, name: name.trim() })))
    ),
    500
  );

  // Groups and membership.
  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (g:Group {code: row.code})
     SET g += row.props
     WITH g, row
     UNWIND row.members AS member
     MATCH (t:Type {code: member})
     MERGE (t)-[r:BELONGS_TO_GROUP]->(g)
     SET r.category = row.props.category`,
    groups.map((g) => ({
      code: g.code,
      props: {
        name: g.name,
        category: g.category,
        keywords: g.keywords,
        description: g.description,
        nickname: g.nickname ?? null,
        formula: g.formula ?? null,
        color: g.color ?? null,
      },
      members: g.types,
    }))
  );

  // Pair readings: the relationship type comes from how the two stacks sit
  // against each other (pairRelations), written from each side so an
  // asymmetric relation carries the reading for that direction.
  for (const rel of new Set(pairRelations.map((r) => r.rel))) {
    const rows = mbtiMatches.flatMap((m) => {
      const forward = relationOf(m.pair[0], m.pair[1]);
      if (forward.rel !== rel) return [];
      const backward = relationOf(m.pair[1], m.pair[0]);
      const base = { name: m.name, score: m.score, featured: m.featured ?? false, description: m.description };
      return [
        { a: m.pair[0], b: m.pair[1], relation: forward.name, reading: forward.reading, ...base },
        { a: m.pair[1], b: m.pair[0], relation: backward.name, reading: backward.reading, ...base },
      ];
    });
    await writeRows(
      session,
      `UNWIND $rows AS row
       MATCH (a:Type {code: row.a}), (b:Type {code: row.b})
       MERGE (a)-[r:${rel}]->(b)
       SET r.name = row.name, r.relation = row.relation, r.reading = row.reading,
           r.score = row.score, r.featured = row.featured, r.description = row.description`,
      rows
    );
  }

  // Directional lore.
  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (a:Type {code: row.type}), (b:Type {code: row.as})
     MERGE (a)-[r:MISTYPES_AS]->(b)
     SET r.when = row.when, r.how = row.how, r.tell = row.tell, r.note = row.note`,
    typeLore.mistypesAs
  );
  await writeRows(
    session,
    `UNWIND $rows AS row
     MATCH (a:Type {code: row.type}), (b:Type {code: row.inner})
     MERGE (a)-[r:HARBORS_INNER]->(b)
     SET r.when = row.when, r.via = row.via, r.how = row.how`,
    typeLore.harborsInner
  );

  // Sources: the provenance every claim points back to.
  await writeRows(
    session,
    `UNWIND $rows AS row
     MERGE (s:Source {index: row.index})
     SET s = row`,
    readJson<SourceRow[]>("src/data/claims/sources.json")
  );
}

// ---------------------------------------------------------------------------
// Claim layer
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

  // Traits observed in the sources share the Trait namespace with mbti-data's lists.
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

  // Nicknames the author uses for a type. Count = how many claims use it.
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

  // Prune what the data files no longer contain.
  await write(session, `MATCH (c:Claim) WHERE NOT c.id IN $ids DETACH DELETE c`, { ids: claims.map((c) => c.id) });
  await write(session, `MATCH (n:Nickname) WHERE NOT (n)<-[:NICKNAMED]-() DETACH DELETE n`);
  await write(session, `MATCH (tr:Trait) WHERE NOT (tr)<-[:HAS_TRAIT|SHOWS_TRAIT]-() DETACH DELETE tr`);
  // Labels the graph used to carry before the claim layer became the knowledge layer.
  await write(session, `MATCH (n) WHERE n:Insight OR n:Series DETACH DELETE n`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

async function report(session: Session) {
  const labels = await session.executeRead((tx) => tx.run("MATCH (n) UNWIND labels(n) AS l RETURN l, count(*) AS c ORDER BY c DESC"));
  console.log("\nNodes");
  for (const r of labels.records) console.log(`  ${String(r.get("l")).padEnd(12)} ${String(r.get("c")).padStart(6)}`);

  const rels = await session.executeRead((tx) => tx.run("MATCH ()-[r]->() RETURN type(r) AS t, count(*) AS c ORDER BY c DESC"));
  console.log("\nRelationships");
  for (const r of rels.records) console.log(`  ${String(r.get("t")).padEnd(22)} ${String(r.get("c")).padStart(6)}`);

  const covered = await readValue<number>(session, `MATCH (s:Source)<-[:FROM_SOURCE]-(:Claim) RETURN count(DISTINCT s) AS n`, "n");
  const total = await readValue<number>(session, `MATCH (s:Source) RETURN count(s) AS n`, "n");
  console.log(`\nClaim coverage: ${covered}/${total} sources`);

  const checks: Array<[string, string]> = [
    ["Sources without a Claim", `MATCH (s:Source) WHERE NOT (s)<-[:FROM_SOURCE]-() RETURN count(s) AS n`],
    ["Types without 8 function slots", `MATCH (t:Type) WHERE size([(t)-[:HAS_FUNCTION_SLOT]->() | 1]) <> 8 RETURN count(t) AS n`],
    ["Types without 4 letters", `MATCH (t:Type) WHERE size([(t)-[:COMPOSED_OF]->() | 1]) <> 4 RETURN count(t) AS n`],
    ["Types without a temperament", `MATCH (t:Type) WHERE NOT (t)-[:BELONGS_TO_GROUP {category: "temperament"}]->() RETURN count(t) AS n`],
    ["Traits not linked to anything", `MATCH (tr:Trait) WHERE NOT (tr)<-[:HAS_TRAIT|SHOWS_TRAIT]-() RETURN count(tr) AS n`],
    ["Claims without a subject", `MATCH (c:Claim) WHERE NOT (c)-[:ABOUT]->() RETURN count(c) AS n`],
  ];
  let ok = true;
  console.log("\nIntegrity");
  for (const [name, cypher] of checks) {
    const n = Number(await readValue<number>(session, cypher, "n"));
    console.log(`  ${n === 0 ? "ok  " : "FAIL"} ${name}: ${n}`);
    if (n !== 0) ok = false;
  }
  return ok;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { values: args } = parseArgs({
    options: {
      reset: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      verify: { type: "boolean", default: false },
    },
  });

  const sources = readJson<SourceRow[]>("src/data/claims/sources.json");
  const vocab = readJson<Vocab>("src/data/claims/vocab.json");
  const claims = loadClaimBatches();

  validate(sources, vocab, claims);
  const claimedSources = new Set(claims.map((c) => c.sourceIndex)).size;
  console.log(`Data ok: ${mbtiTypes.length} types, ${groups.length} groups, ${sources.length} sources, ${claims.length} claims over ${claimedSources} of them`);
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
    console.log("Loading core layer...");
    await loadCore(session);
    console.log("Loading claim layer...");
    await loadClaims(session, vocab, claims);
    if (!(await report(session))) {
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
