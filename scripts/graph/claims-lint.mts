/**
 * Check that every type code / cognitive function explicitly named in a claim's
 * statement is also present in its `subjects` / `functions`.
 *
 *   node scripts/graph/claims-lint.mts         # report only
 *   node scripts/graph/claims-lint.mts --fix   # add missing Type subjects and
 *                                              # functions (evidence: explicit)
 */
import fs from "node:fs";
import path from "node:path";
import { rootDir } from "./env.mts";

const TYPES = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];
const FUNCS = ["Ni","Ne","Si","Se","Ti","Te","Fi","Fe"];
const TYPE_RE = new RegExp(`\\b(${TYPES.join("|")})\\b`, "g");
const FUNC_RE = new RegExp(`\\b(${FUNCS.join("|")})\\b`, "g");

interface Claim {
  id: string;
  statement: string;
  subjects: Array<{ kind: "Type" | "Group"; key: string }>;
  functions?: Array<{ code: string; evidence: string }>;
}

const fix = process.argv.includes("--fix");
const dir = path.join(rootDir, "src/data/claims");
let missingTypes = 0, missingFuncs = 0, upgraded = 0;

for (const f of fs.readdirSync(dir).filter((f) => /^batch-\d{3}\.json$/.test(f)).sort()) {
  const file = path.join(dir, f);
  const batch = JSON.parse(fs.readFileSync(file, "utf-8")) as { claims: Claim[] };
  let changed = false;
  for (const c of batch.claims) {
    const types = new Set(c.statement.match(TYPE_RE) ?? []);
    const funcs = new Set(c.statement.match(FUNC_RE) ?? []);
    for (const t of types) {
      if (c.subjects.some((s) => s.kind === "Type" && s.key === t)) continue;
      missingTypes++;
      if (fix) { c.subjects.push({ kind: "Type", key: t }); changed = true; }
      else console.log(`${c.id}: mentions ${t} but subjects = ${c.subjects.map((s) => s.key).join(",")}`);
    }
    for (const fn of funcs) {
      const cur = (c.functions ??= []).find((x) => x.code === fn);
      if (!cur) {
        missingFuncs++;
        if (fix) { c.functions.push({ code: fn, evidence: "explicit" }); changed = true; }
        else console.log(`${c.id}: mentions ${fn} but functions = ${c.functions.map((x) => x.code).join(",") || "(none)"}`);
      } else if (cur.evidence !== "explicit") {
        upgraded++;
        if (fix) { cur.evidence = "explicit"; changed = true; }
      }
    }
  }
  if (fix && changed) fs.writeFileSync(file, JSON.stringify(batch, null, 2) + "\n");
}
console.log(`${fix ? "Fixed" : "Found"}: ${missingTypes} missing Type subjects, ${missingFuncs} missing functions, ${upgraded} functions upgraded to explicit`);
