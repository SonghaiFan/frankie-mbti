/**
 * Print the sources in src/data/claims/sources.json that have no claims yet, so
 * they can be extracted into the next src/data/claims/batch-NNN.json.
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
const batches = fs.readdirSync(claimsDir).filter((f) => /^batch-\d{3}\.json$/.test(f)).sort();
const covered = new Set<number>();
for (const f of batches) {
  const batch = JSON.parse(fs.readFileSync(path.join(claimsDir, f), "utf-8")) as { claims: Array<{ sourceIndex: number }> };
  for (const c of batch.claims) covered.add(c.sourceIndex);
}

const sources = readJson<Array<{ index: number; title: string }>>("src/data/claims/sources.json");
const pending = sources.filter((s) => !covered.has(s.index));
console.log(`Claim coverage: ${covered.size}/${sources.length} sources in ${batches.length} batches; ${pending.length} pending.`);
if (args.status || !pending.length) process.exit(0);

const nextBatchId = `batch-${String(batches.length + 1).padStart(3, "0")}`;
console.log(`\nNext batch: ${nextBatchId} -> src/data/claims/${nextBatchId}.json\n`);
for (const s of pending.slice(0, Number(args.size))) console.log(`#${String(s.index).padStart(3, "0")}  ${s.title}`);
