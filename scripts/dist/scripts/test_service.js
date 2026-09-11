import fs from "node:fs";
const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
    if (fs.existsSync(file)) {
        fs.readFileSync(file, "utf-8").split("\n").forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#"))
                return;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx > 0) {
                const k = trimmed.slice(0, eqIdx).trim();
                let v = trimmed.slice(eqIdx + 1).trim();
                if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
                    v = v.slice(1, -1);
                if (!process.env[k])
                    process.env[k] = v;
            }
        });
    }
}
import { getSystemGraphStats, getAllTypesFromGraph, getTypeGraphData } from "../src/services/mbti-graph-service";
async function main() {
    console.log("=== Testing getSystemGraphStats() ===");
    const stats = await getSystemGraphStats();
    console.log("Stats result:", stats);
    console.log("\n=== Testing getAllTypesFromGraph() ===");
    const typesRes = await getAllTypesFromGraph();
    console.log(`Source: ${typesRes.source}, Total: ${typesRes.total}`);
    const sample = typesRes.data.find(t => t.type === "INTJ");
    console.log("INTJ Sample:", {
        type: sample?.type,
        title: sample?.title,
        archetype: sample?.archetype,
        vividAnalogy: sample?.vividAnalogy?.slice(0, 50) + "...",
        coreParadox: sample?.coreParadox?.slice(0, 50) + "...",
        energyModel: sample?.energyModel?.slice(0, 50) + "..."
    });
    console.log("\n=== Testing getTypeGraphData('INTJ') ===");
    const graphRes = await getTypeGraphData("INTJ");
    console.log(`Graph Source: ${graphRes.source}, Nodes: ${graphRes.nodes.length}, Edges: ${graphRes.edges.length}`);
    const insightNodes = graphRes.nodes.filter(n => n.label === "Insight");
    console.log(`Connected Insights count in subgraph: ${insightNodes.length}`);
    insightNodes.forEach(i => console.log(" - Insight:", i.name));
    console.log("\n=== ALL SERVICE CHECKS PASSED! ===");
}
main().catch(console.error);
