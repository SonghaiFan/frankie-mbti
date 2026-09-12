/**
 * Print the next sources that have no claims yet, so they can be extracted into
 * src/data/claims/batch-NNN.json. Transcripts are read from src/data/catalogue.csv
 * when that file is present (it is not part of the graph); otherwise the insight's
 * cleaned text is printed instead.
 *
 *   node scripts/graph/claims-next.mts            # next 20 uncovered sources
 *   node scripts/graph/claims-next.mts --size 10  # smaller batch
 *   node scripts/graph/claims-next.mts --status   # only print coverage
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { readJson, rootDir } from "./env.mts";

const { values: args } = parseArgs({
  options: {
    size: { type: "string", default: "20" },
    status: { type: "boolean", default: false },
  },
});

const claimsDir = path.join(rootDir, "src/data/claims");
fs.mkdirSync(claimsDir, { recursive: true });
const batches = fs.readdirSync(claimsDir).filter((f) => /^batch-\d{3}\.json$/.test(f)).sort();
const covered = new Set<number>();
for (const f of batches) {
  const batch = JSON.parse(fs.readFileSync(path.join(claimsDir, f), "utf-8")) as { claims: Array<{ sourceIndex: number }> };
  for (const c of batch.claims) covered.add(c.sourceIndex);
}

interface Insight {
  sourceIndex: number;
  title: string;
  targets: string[];
  quote?: string;
  cleanedText?: string;
}
const insights = readJson<Insight[]>("src/data/core/insights.json");
const byIndex = new Map(insights.map((i) => [i.sourceIndex, i]));

// Raw transcripts straight from the CSV when it exists (well-formed rows, quoted only
// when they contain commas/newlines).
function readTranscripts(): string[] | null {
  const csvPath = path.join(rootDir, "src/data/catalogue.csv");
  if (!fs.existsSync(csvPath)) return null;
  const csv = fs.readFileSync(csvPath, "utf-8").replace(/^\uFEFF/, "");
  const rows: string[] = [];
  let cell = "", quoted = false, row: string[] = [];
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (quoted) {
      if (ch === '"' && csv[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row[4] ?? ""); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row[4] ?? ""); }
  return rows.slice(1); // drop header
}
const transcripts = readTranscripts();
const texts = transcripts ?? insights.map((i) => i.cleanedText ?? "");

const total = texts.length;
const pending = Array.from({ length: total }, (_, i) => i + 1).filter((i) => !covered.has(i));
console.log(`Claim coverage: ${covered.size}/${total} sources in ${batches.length} batches; ${pending.length} pending.`);
if (args.status || !pending.length) process.exit(0);

const nextBatchId = `batch-${String(batches.length + 1).padStart(3, "0")}`;
const size = Number(args.size);
console.log(`\nNext batch: ${nextBatchId} -> src/data/claims/${nextBatchId}.json\n`);

for (const idx of pending.slice(0, size)) {
  const ins = byIndex.get(idx);
  console.log(`===== source ${idx} | targets: ${ins?.targets.join(", ") ?? "?"} | ${ins?.title ?? ""}`);
  console.log(texts[idx - 1].trim());
  console.log();
}
