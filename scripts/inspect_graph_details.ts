import fs from "node:fs";
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

async function main() {
  console.log("=== 1. Inspecting Dimensions ===");
  const dims = await session.run(`MATCH (d:Dimension) RETURN d`);
  dims.records.forEach(r => console.log(r.get("d").properties));

  console.log("\n=== 2. Inspecting Groups ===");
  const grps = await session.run(`MATCH (g:Group) RETURN g`);
  grps.records.forEach(r => console.log(r.get("g").properties));

  console.log("\n=== 3. Inspecting Functions and Relationships ===");
  const funcs = await session.run(`MATCH (f:Function) RETURN f`);
  funcs.records.forEach(r => console.log(r.get("f").properties));

  const funcRels = await session.run(`MATCH (f1:Function)-[r]-(f2:Function) RETURN type(r) as t, f1.code, f2.code LIMIT 20`);
  console.log("Function-Function rels:", funcRels.records.map(r => `${r.get("f1.code")} -[${r.get("t")}]-> ${r.get("f2.code")}`));

  console.log("\n=== 4. Inspecting Type-Type Relationships ===");
  const typeRels = await session.run(`MATCH (t1:Type)-[r]-(t2:Type) RETURN distinct type(r) as t, count(r) as cnt`);
  typeRels.records.forEach(r => console.log(r.get("t"), r.get("cnt").toNumber()));

  console.log("\n=== 5. Inspecting Trait Duplicates / Counts ===");
  const traitSample = await session.run(`
    MATCH (tr:Trait)
    WITH tr.name AS name, count(tr) AS cnt, collect(id(tr)) AS ids
    WHERE cnt > 1
    RETURN name, cnt, ids LIMIT 15
  `);
  console.log("Duplicate Trait names count:", traitSample.records.length);
  traitSample.records.forEach(r => console.log(r.get("name"), r.get("cnt").toNumber()));

  const totalDuplicateTraits = await session.run(`
    MATCH (tr:Trait)
    WITH tr.name AS name, count(tr) AS cnt
    WHERE cnt > 1
    RETURN count(name) AS dupNames, sum(cnt) - count(name) AS excessNodes
  `);
  console.log("Total duplicate trait summary:", totalDuplicateTraits.records[0].get("dupNames").toNumber(), "names have duplicates, totaling", totalDuplicateTraits.records[0].get("excessNodes").toNumber(), "excess nodes.");

  await session.close();
  await driver.close();
}

main().catch(console.error);
