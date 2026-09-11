import fs from "node:fs";
import path from "node:path";
import neo4j from "neo4j-driver";

const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
  if (fs.existsSync(file)) {
    fs.readFileSync(file, "utf-8").split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const k = trimmed.slice(0, eqIdx).trim();
        let v = trimmed.slice(eqIdx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!process.env[k]) process.env[k] = v;
      }
    });
  }
}

const driver = neo4j.driver(process.env.NEO4J_URI!, neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!));
const session = driver.session();

async function verify() {
  console.log("=== Node Counts by Label ===");
  const nodeLabels = await session.run(`MATCH (n) RETURN distinct labels(n) as lbl, count(n) as cnt ORDER BY cnt DESC`);
  nodeLabels.records.forEach(r => console.log(r.get("lbl"), r.get("cnt").toNumber()));

  console.log("\n=== Relationship Counts by Type ===");
  const relTypes = await session.run(`MATCH ()-[r]->() RETURN distinct type(r) as t, count(r) as cnt ORDER BY cnt DESC`);
  relTypes.records.forEach(r => console.log(r.get("t"), r.get("cnt").toNumber()));

  console.log("\n=== Sample Type Inspection (INTJ) ===");
  const intjInspect = await session.run(`
    MATCH (t:Type {code: 'INTJ'})
    OPTIONAL MATCH (t)-[:COMPOSED_OF]->(l:Letter)
    OPTIONAL MATCH (t)-[rg:BELONGS_TO_GROUP]->(g:Group)
    OPTIONAL MATCH (t)-[rd:DUAL_COMPLEMENT]->(dual:Type)
    OPTIONAL MATCH (t)-[rs:SHADOW_MIRROR]->(shadow:Type)
    OPTIONAL MATCH (t)-[rp:PAIR_DYNAMIC]->(pair:Type)
    OPTIONAL MATCH (t)-[rf:HAS_FUNCTION_SLOT]->(f:Function)
    RETURN t.code AS type,
           collect(DISTINCT l.code) AS letters,
           collect(DISTINCT g.code) AS groups,
           collect(DISTINCT {target: dual.code, name: rd.name}) AS duals,
           collect(DISTINCT {target: shadow.code, name: rs.name}) AS shadows,
           collect(DISTINCT {target: pair.code, name: rp.name}) AS pairs,
           collect(DISTINCT {slot: rf.slot, role: rf.role, func: f.code}) AS beebeFunctions
  `);
  const r = intjInspect.records[0];
  console.log("INTJ Letters:", r.get("letters"));
  console.log("INTJ Groups:", r.get("groups"));
  console.log("INTJ Dual:", r.get("duals"));
  console.log("INTJ Shadow:", r.get("shadows"));
  console.log("INTJ Author Pairs:", r.get("pairs"));
  const funcs = r.get("beebeFunctions").sort((a: any, b: any) => a.slot - b.slot);
  console.log("INTJ 8 Beebe Functions:", funcs);

  await session.close();
  await driver.close();
}

verify().catch(console.error);
