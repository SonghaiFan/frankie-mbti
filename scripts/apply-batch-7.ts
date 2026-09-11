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
        if (!trimmed || trimmed.startsWith("#")) return;
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

interface BatchEntry {
  id: string;
  sourceIndex: number;
  types: string[];
  series: string;
  title: string;
  archetype?: string;
  analogy?: string;
  coreParadox?: string;
  energyMechanism?: string;
  quote: string;
  cleanedText: string;
  actionableAdvice: string;
}

import { batch7Data } from "./batch7-data.js";

async function runBatch7() {
  loadEnv();

  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    throw new Error("Missing Neo4j connection credentials in environment.");
  }

  console.log(`Connecting to Neo4j at ${uri}...`);
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  try {
    console.log(`=== INGESTING BATCH 7 (Entries 241-290, Size: ${batch7Data.length}) ===`);

    // 1. Ensure Series nodes exist
    const seriesList = [
      "深度画像与本命天赋",
      "亲密关系与情感解构",
      "社交互动与冲突",
      "职业发展与成长",
      "进阶提升与成长指南",
    ];

    for (const sName of seriesList) {
      await session.run(
        `MERGE (s:Series {name: $name})
         ON CREATE SET s.createdAt = datetime()
         RETURN s`,
        { name: sName }
      );
    }
    console.log(`Ensured ${seriesList.length} Series nodes.`);

    // 2. Insert Batch 7 Insights
    for (const entry of batch7Data) {
      const params = {
        id: entry.id,
        sourceIndex: entry.sourceIndex,
        title: entry.title,
        archetype: entry.archetype || null,
        analogy: entry.analogy || null,
        coreParadox: entry.coreParadox || null,
        energyMechanism: entry.energyMechanism || null,
        quote: entry.quote,
        cleanedText: entry.cleanedText,
        actionableAdvice: entry.actionableAdvice,
        seriesName: entry.series,
      };

      await session.run(
        `MERGE (i:Insight {id: $id})
         SET i.sourceIndex = $sourceIndex,
             i.title = $title,
             i.archetype = $archetype,
             i.analogy = $analogy,
             i.coreParadox = $coreParadox,
             i.energyMechanism = $energyMechanism,
             i.quote = $quote,
             i.cleanedText = $cleanedText,
             i.actionableAdvice = $actionableAdvice,
             i.updatedAt = datetime()
         WITH i
         MATCH (s:Series {name: $seriesName})
         MERGE (i)-[:BELONGS_TO_SERIES]->(s)
         RETURN i.id`,
        params
      );

      // Connect to associated MBTI Types
      for (const typeCode of entry.types) {
        if (typeCode === "ALL") continue;
        await session.run(
          `MATCH (t:Type {code: $typeCode})
           MATCH (i:Insight {id: $id})
           MERGE (t)-[r:HAS_INSIGHT]->(i)
           ON CREATE SET r.createdAt = datetime()
           RETURN count(r)`,
          { typeCode, id: entry.id }
        );
      }
    }
    console.log(`Ingested ${batch7Data.length} Insight nodes and Type linkages.`);

    // 3. Update Type core properties for INTJ, INFP, ENTP
    console.log("Updating Type properties for INTJ, INFP, ENTP...");
    await session.run(
      `MATCH (t:Type {code: 'INTJ'})
       SET t.archetype = '国家特级操盘手 / 幕后帝师 / 终极星盘推手',
           t.vividAnalogy = '出门拿快递都要算风阻与最优路线的暗夜棋圣；吃一次亏复盘几十年；情绪稳定是天才，一旦着急变成白痴；万物发生皆有利于我',
           t.coreParadox = '看似不近人情算无遗策，内心却常背负自责、愧疚与自我否定的重担；反复推开你做压力测试，只为核验你是否坚定不移',
           t.energyModel = '主导Ni超凡远瞻天道规律 + 辅助Te以身入局步步为营 + 第三Fi深藏的极致纯爱 + 劣势Se急躁时现实触觉易短路'`
    );

    await session.run(
      `MATCH (t:Type {code: 'INFP'})
       SET t.archetype = '纯爱守炉人 / 熟后极颠的宝藏诗人 / 审美艺术家',
           t.vividAnalogy = '不熟时文静腼腆，熟络后比谁都颠、句句话有梗；心里跟明镜似的，宁可吃尽苦头也绝不接受被工具化物化；不争吵回避只为捍卫双方价值独立',
           t.coreParadox = '深陷若隐若现的不配得感自卑阴影，用过度付出掩盖瑕疵；但在灵魂纯粹性上寸步不让，有一百块愿花九十九块在认准的真爱上',
           t.energyModel = '主导Fi绝对笃定的内在神圣信仰 + 辅助Ne捕捉超现实灵感与荒诞梗 + 第三Si怀旧深沉 + 劣势Te抗拒功利机器规训'`
    );

    await session.run(
      `MATCH (t:Type {code: 'ENTP'})
       SET t.archetype = '人间风流客 / 破局女侠 / 星图织网者',
       t.vividAnalogy = '自带聚光灯与浪子气质的江湖奇侠；斩男又斩女，幽默从不用力过猛；常披着ENFP甜妹假面，对专业拉垮又爱耍心机的装逼犯毒舌冷嘲绝决劝退',
       t.coreParadox = '嘴比钢铁硬、以创飞全世界为乐，内里却对认同的同行者展现惊人浪漫与包容；思维像满天繁星，点线成网瞬间顿悟',
       t.energyModel = '主导Ne打破陈规自由探索 + 辅助Ti构建严密底层模型 + 第三Fe逐渐习得共情与浪漫体恤 + 劣势Si抗拒机械重复'`
    );

    // 4. Final DB Stats
    const countRes = await session.run(`
      MATCH (n)
      WITH count(n) AS totalNodes
      MATCH ()-[r]->()
      RETURN totalNodes, count(r) AS totalRels
    `);
    const nodeCount = countRes.records[0].get("totalNodes").toNumber();
    const relCount = countRes.records[0].get("totalRels").toNumber();

    console.log(`\n=== BATCH 7 (50 entries) INGESTION COMPLETE ===`);
    console.log(`Live Neo4j AuraDB Stats: ${nodeCount} Nodes, ${relCount} Relationships.`);
  } finally {
    await session.close();
    await driver.close();
  }
}

runBatch7().catch((err) => {
  console.error("Batch 7 ingestion failed:", err);
  process.exit(1);
});
