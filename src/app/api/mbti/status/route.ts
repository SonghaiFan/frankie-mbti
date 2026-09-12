import { NextResponse } from "next/server";
import { getNeo4jDriver, withNeo4jSession } from "@/lib/neo4j";

/** Feeds the "Graph N" badge in the header: is the graph reachable, and how big is it. */
export async function GET() {
  const driver = getNeo4jDriver();
  if (!driver) return NextResponse.json({ connected: false, nodes: 0, relationships: 0 });

  const stats = await withNeo4jSession(async (session) => {
    const info = await driver.getServerInfo();
    const result = await session.run(`
      MATCH (n) WITH count(n) AS nodes
      MATCH ()-[r]->() RETURN nodes, count(r) AS rels
    `);
    const rec = result.records[0];
    return {
      connected: true,
      serverAgent: info.agent,
      nodes: Number(rec?.get("nodes")) || 0,
      relationships: Number(rec?.get("rels")) || 0,
    };
  });

  return NextResponse.json(stats ?? { connected: false, nodes: 0, relationships: 0 });
}
