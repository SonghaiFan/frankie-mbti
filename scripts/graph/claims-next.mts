/**
 * Print the next sources that have no claims yet, so they can be extracted into
 * src/data/graph/claims/batch-NNN.json.
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

const claimsDir = path.join(rootDir, "src/data/graph/claims");
fs.mkdirSync(claimsDir, { recursive: true });
const batches = fs.readdirSync(claimsDir).filter((f) => /^batch-\d{3}\.json$/.test(f)).sort();
const covered = new Set<number>();
for (const f of batches) {
  const batch = JSON.parse(fs.readFileSync(path.join(claimsDir, f), "utf-8")) as { sources: Array<{ sourceIndex: number }> };
  for (const s of batch.sources) covered.add(s.sourceIndex);
}

interface Insight {
  sourceIndex: number;
  title: string;
  targets: string[];
  quote?: string;
  cleanedText?: string;
}
const insights = readJson<Insight[]>("src/data/graph/insights.json");
const byIndex = new Map(insights.map((i) => [i.sourceIndex, i]));

// Raw transcripts straight from the CSV (same parser as migrate.mts would be overkill here:
// rows are well-formed, quoted only when they contain commas/newlines).
const csv = fs.readFileSync(path.join(rootDir, "src/data/catalogue.csv"), "utf-8").replace(/^﻿/, "");
const rows: string[] = [];
{
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
}
const texts = rows.slice(1); // drop header

const total = texts.length;
const pending = Array.from({ length: total }, (_, i) => i + 1).filter((i) => !covered.has(i));
console.log(`Claim coverage: ${covered.size}/${total} sources in ${batches.length} batches; ${pending.length} pending.`);
if (args.status || !pending.length) process.exit(0);

const nextBatchId = `batch-${String(batches.length + 1).padStart(3, "0")}`;
const size = Number(args.size);
console.log(`\nNext batch: ${nextBatchId} -> src/data/graph/claims/${nextBatchId}.json\n`);

for (const idx of pending.slice(0, size)) {
  const ins = byIndex.get(idx);
  console.log(`===== source ${idx} | targets: ${ins?.targets.join(", ") ?? "?"} | ${ins?.title ?? ""}`);
  console.log(texts[idx - 1].trim());
  console.log();
}
