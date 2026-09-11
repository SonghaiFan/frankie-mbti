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
  console.log("=== 1. Inspecting Series Names ===");
  const series = await session.run(`MATCH (s:Series) RETURN s.name AS name, count{(s)<-[:BELONGS_TO_SERIES]-()} as cnt ORDER BY cnt DESC`);
  series.records.forEach(r => console.log(`[${r.get("cnt").toNumber()} insights] ${r.get("name")}`));

  console.log("\n=== 2. Inspecting Trait Sample & Categories ===");
  const traitCats = await session.run(`MATCH (tr:Trait) RETURN distinct tr.category as cat, count(tr) as cnt ORDER BY cnt DESC`);
  traitCats.records.forEach(r => console.log(`Category: ${r.get("cat")}, Count: ${r.get("cnt").toNumber()}`));

  const traitSample = await session.run(`MATCH (tr:Trait) RETURN tr.name as name, tr.category as cat, tr.description as desc LIMIT 20`);
  traitSample.records.forEach(r => console.log(`- [${r.get("cat")}] ${r.get("name")}: ${r.get("desc")}`));

  console.log("\n=== 3. Inspecting Opinion & Context nodes ===");
  const opSample = await session.run(`MATCH (o:Opinion) RETURN o.content as c LIMIT 5`);
  opSample.records.forEach(r => console.log(`Opinion: ${r.get("c")}`));

  const ctxSample = await session.run(`MATCH (c:Context) RETURN c.name as name, c.type as type LIMIT 5`);
  ctxSample.records.forEach(r => console.log(`Context: ${r.get("name")} (${r.get("type")})`));

  await session.close();
  await driver.close();
}

main().catch(console.error);
