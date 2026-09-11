import fs from "node:fs";
import path from "node:path";
import neo4j from "neo4j-driver";
const rootDir = process.cwd();
function loadEnv() {
    const envFiles = [".env.local", ".env"];
    for (const file of envFiles) {
        const fullPath = path.join(rootDir, file);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, "utf-8");
            content.split("\n").forEach((line) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith("#"))
                    return;
                const eqIdx = trimmed.indexOf("=");
                if (eqIdx > 0) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    let val = trimmed.slice(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            });
        }
    }
}
async function applyConsolidationAndRelations() {
    loadEnv();
    const dataPath = path.join(rootDir, "scripts/consolidation_data.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    const uri = process.env.NEO4J_URI || process.env.NEXT_PUBLIC_NEO4J_URI;
    const username = process.env.NEO4J_USERNAME || process.env.NEXT_PUBLIC_NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD || process.env.NEXT_PUBLIC_NEO4J_PASSWORD;
    if (!uri || !username || !password) {
        throw new Error("Missing Neo4j connection parameters in environment variables!");
    }
    console.log(`Connecting to Neo4j at ${uri}...`);
    const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    const session = driver.session();
    try {
        console.log("=== 1. CONSOLIDATING SERIES NODES ===");
        // Redirect duplicate Series to canonical Series
        await session.run(`
      MATCH (ins:Insight)-[r:BELONGS_TO_SERIES]->(sOld:Series)
      WHERE sOld.name IN ['亲密关系与恋爱全流程', '亲密关系与恋爱真相']
      MATCH (sNew:Series {name: '亲密关系与情感解构'})
      MERGE (ins)-[:BELONGS_TO_SERIES]->(sNew)
      DELETE r
    `);
        await session.run(`
      MATCH (ins:Insight)-[r:BELONGS_TO_SERIES]->(sOld:Series)
      WHERE sOld.name IN ['四大组别的终极心性修行', '高阶心性修炼']
      MATCH (sNew:Series {name: '进阶提升与成长指南'})
      MERGE (ins)-[:BELONGS_TO_SERIES]->(sNew)
      DELETE r
    `);
        await session.run(`
      MATCH (ins:Insight)-[r:BELONGS_TO_SERIES]->(sOld:Series)
      WHERE sOld.name = '误测与形态代偿'
      MATCH (sNew:Series {name: '误测与形态自救'})
      MERGE (ins)-[:BELONGS_TO_SERIES]->(sNew)
      DELETE r
    `);
        // Clean up empty Series nodes
        const delRes = await session.run(`
      MATCH (s:Series)
      WHERE NOT (s)<-[:BELONGS_TO_SERIES]-()
      DETACH DELETE s
      RETURN count(s) AS deletedCount
    `);
        console.log(`Consolidated series. Removed ${delRes.records[0].get("deletedCount").toNumber()} empty Series nodes.`);
        console.log("\n=== 2. CATEGORIZING AND STRUCTURING TRAIT NODES ===");
        await session.run(`
      MATCH (tr:Trait)
      SET tr.category = CASE
        WHEN tr.name =~ '.*(易|不|难|怕|差|累|焦虑|固执|强迫|拖延|脆弱|纠结|内耗|自卑|自责).*' THEN 'weakness'
        WHEN tr.name =~ '.*(善于|擅于|强|准|快|好|敏锐|坚定|独立|果断|深刻|洞察|专注|自律|执着).*' THEN 'strength'
        WHEN tr.name =~ '.*(表面|礼貌|活泼|随和|热情|假笑|冷淡|客观|温和|客气).*' THEN 'surface'
        ELSE 'actual'
      END
    `);
        const traitStat = await session.run(`
      MATCH (tr:Trait)
      RETURN tr.category AS cat, count(tr) AS cnt
    `);
        console.log("Trait Category Breakdown:");
        traitStat.records.forEach((r) => console.log(` - ${r.get("cat")}: ${r.get("cnt").toNumber()}`));
        console.log("\n=== 3. CREATING DIMENSIONS AND LETTERS ENTITIES ===");
        for (const d of data.dimensions) {
            await session.run(`MERGE (dim:Dimension {name: $name})
         SET dim.code = $code,
             dim.poleA = $poleA,
             dim.poleB = $poleB,
             dim.poleAName = $poleAName,
             dim.poleBName = $poleBName,
             dim.poleADesc = $poleADesc,
             dim.poleBDesc = $poleBDesc,
             dim.updatedAt = datetime()`, d);
        }
        console.log("Ensured 4 Dimension nodes.");
        for (const l of data.letters) {
            await session.run(`MERGE (let:Letter {code: $code})
         SET let.name = $name,
             let.nickname = $nickname,
             let.definition = $definition,
             let.pole = $pole,
             let.updatedAt = datetime()
         WITH let
         MATCH (dim:Dimension {name: $dimensionName})
         MERGE (let)-[:BELONGS_TO_DIMENSION]->(dim)`, l);
        }
        console.log("Ensured 8 Letter nodes and linked to Dimensions.");
        // Link 16 Types to constituent Letters
        const typesRes = await session.run(`MATCH (t:Type) RETURN t.code AS code`);
        for (const rec of typesRes.records) {
            const code = rec.get("code");
            if (typeof code === "string" && code.length === 4) {
                const [l1, l2, l3, l4] = code.split("");
                await session.run(`MATCH (t:Type {code: $code})
           MATCH (let1:Letter {code: $l1})
           MATCH (let2:Letter {code: $l2})
           MATCH (let3:Letter {code: $l3})
           MATCH (let4:Letter {code: $l4})
           MERGE (t)-[:COMPOSED_OF {slot: 1}]->(let1)
           MERGE (t)-[:COMPOSED_OF {slot: 2}]->(let2)
           MERGE (t)-[:COMPOSED_OF {slot: 3}]->(let3)
           MERGE (t)-[:COMPOSED_OF {slot: 4}]->(let4)`, { code, l1, l2, l3, l4 });
            }
        }
        console.log("Linked all 16 Types to their 4 constituent Letters.");
        console.log("\n=== 4. CREATING TWO-LETTER AND THREE-LETTER GROUPS ===");
        for (const g of data.groups) {
            await session.run(`MERGE (grp:Group {code: $code})
         SET grp.name = $name,
             grp.type = $type,
             grp.category = $category,
             grp.color = $color,
             grp.keywords = $keywords,
             grp.description = $description,
             grp.vividMetaphor = $vividMetaphor,
             grp.updatedAt = datetime()`, {
                code: g.code,
                name: g.name,
                type: g.type,
                category: g.category,
                color: g.color || "slate",
                keywords: g.keywords || "",
                description: g.description || "",
                vividMetaphor: g.vividMetaphor || "",
            });
        }
        console.log(`Ensured ${data.groups.length} Group nodes (Two-letter & Three-letter).`);
        // Connect Types to Groups based on pattern matching
        const allTypes = ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"];
        for (const tCode of allTypes) {
            for (const g of data.groups) {
                let isMatch = false;
                const gCode = g.code;
                if (g.type === "two_letter") {
                    const [c1, c2] = gCode.split("");
                    if (tCode.includes(c1) && tCode.includes(c2)) {
                        isMatch = true;
                    }
                }
                else if (g.type === "three_letter") {
                    if (gCode.startsWith("x")) {
                        const suffix = gCode.slice(1);
                        if (tCode.endsWith(suffix) || (tCode.includes(suffix[0]) && tCode.includes(suffix[1]))) {
                            isMatch = true;
                        }
                    }
                    else if (gCode.endsWith("x")) {
                        const prefix = gCode.slice(0, 2);
                        if (tCode.startsWith(prefix)) {
                            isMatch = true;
                        }
                    }
                    else {
                        const [c1, c2, c3] = gCode.split("");
                        if (tCode.includes(c1) && tCode.includes(c2) && tCode.includes(c3)) {
                            isMatch = true;
                        }
                    }
                }
                if (isMatch) {
                    await session.run(`MATCH (t:Type {code: $tCode})
             MATCH (g:Group {code: $gCode})
             MERGE (t)-[r:BELONGS_TO_GROUP]->(g)
             SET r.category = $category, r.type = $type`, { tCode, gCode, category: g.category, type: g.type });
                }
            }
        }
        console.log("Interconnected all 16 Types to Two-letter & Three-letter Groups.");
        console.log("\n=== 5. BUILDING 16-TO-16 TYPE DYNAMIC RELATIONSHIPS ===");
        for (const [t1, t2, name, desc] of data.typeRelations.dual) {
            await session.run(`MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:DUAL_COMPLEMENT]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:DUAL_COMPLEMENT]->(a)
         SET r2.name = $name, r2.description = $desc`, { t1, t2, name, desc });
        }
        console.log("Built 8 Dual Complement pairs (16 relationships).");
        for (const [t1, t2, name, desc] of data.typeRelations.shadow) {
            await session.run(`MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:SHADOW_MIRROR]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:SHADOW_MIRROR]->(a)
         SET r2.name = $name, r2.description = $desc`, { t1, t2, name, desc });
        }
        console.log("Built 8 Shadow Mirror pairs (16 relationships).");
        for (const [t1, t2, name, desc] of data.typeRelations.dominant) {
            await session.run(`MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:SHARED_DOMINANT]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:SHARED_DOMINANT]->(a)
         SET r2.name = $name, r2.description = $desc`, { t1, t2, name, desc });
        }
        console.log("Built 8 Shared Dominant pairs (16 relationships).");
        for (const [t1, t2, name, desc] of data.typeRelations.quasi) {
            await session.run(`MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:QUASI_IDENTICAL]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:QUASI_IDENTICAL]->(a)
         SET r2.name = $name, r2.description = $desc`, { t1, t2, name, desc });
        }
        console.log("Built 8 Quasi-Identical pairs (16 relationships).");
        for (const [t1, t2, name, desc] of data.typeRelations.author_pairs) {
            await session.run(`MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:PAIR_DYNAMIC]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:PAIR_DYNAMIC]->(a)
         SET r2.name = $name, r2.description = $desc`, { t1, t2, name, desc });
        }
        console.log("Built 7 Author Special Pair Dynamics (14 relationships).");
        console.log("\n=== 6. JUNG COGNITIVE AXES & BEEBE 8-FUNCTION STACK ===");
        for (const ax of data.functionAxes) {
            await session.run(`MATCH (a:Function {code: $funcA}), (b:Function {code: $funcB})
         MERGE (a)-[r1:PAIRED_AXIS]->(b)
         SET r1.name = $name, r1.category = $category, r1.description = $description
         MERGE (b)-[r2:PAIRED_AXIS]->(a)
         SET r2.name = $name, r2.category = $category, r2.description = $description`, ax);
        }
        console.log("Built 4 Functional Paired Axes (8 relationships).");
        for (const tCode of allTypes) {
            const stack = data.beebeStacks[tCode];
            for (let i = 0; i < 8; i++) {
                const slot = i + 1;
                const funcCode = stack[i];
                const roleInfo = data.beebeRoles[i];
                await session.run(`MATCH (t:Type {code: $tCode})
           MATCH (f:Function {code: $funcCode})
           MERGE (t)-[r:HAS_FUNCTION_SLOT {slot: $slot}]->(f)
           SET r.role = $role,
               r.cnRole = $cnRole,
               r.desc = $desc`, {
                    tCode,
                    funcCode,
                    slot,
                    role: roleInfo.role,
                    cnRole: roleInfo.cnRole,
                    desc: roleInfo.desc,
                });
            }
        }
        console.log("Connected all 16 Types to full 8-Function Beebe Stack (128 slot relationships).");
        // Final DB Stats Check
        const countRes = await session.run(`
      MATCH (n)
      WITH count(n) AS totalNodes
      MATCH ()-[r]->()
      RETURN totalNodes, count(r) AS totalRels
    `);
        const nodeCount = countRes.records[0].get("totalNodes").toNumber();
        const relCount = countRes.records[0].get("totalRels").toNumber();
        console.log("\n===================================================================");
        console.log("=== GRAPH CONSOLIDATION & MULTI-LEVEL RELATIONS COMPLETE! ===");
        console.log("===================================================================");
        console.log(`Live Neo4j AuraDB Stats: ${nodeCount} Nodes, ${relCount} Relationships.`);
    }
    finally {
        await session.close();
        await driver.close();
    }
}
applyConsolidationAndRelations().catch((err) => {
    console.error("Consolidation and relations failed:", err);
    process.exit(1);
});
