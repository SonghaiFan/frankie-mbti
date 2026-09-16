import neo4j, { Driver, Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver | null {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME || "neo4j";
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !password) {
    return null;
  }

  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      maxConnectionLifetime: 3 * 60 * 60 * 1000,
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 20000,
    });
  }

  return driver;
}

export async function withNeo4jSession<T>(
  action: (session: Session) => Promise<T>,
  database = process.env.NEO4J_DATABASE || "neo4j"
): Promise<T | null> {
  const d = getNeo4jDriver();
  if (!d) return null;

  const session = d.session({ database });
  try {
    return await action(session);
  } catch (error) {
    const isUnreachable =
      error instanceof Error &&
      (error.message.includes("ENOTFOUND") ||
        error.message.includes("ServiceUnavailable") ||
        (error as { code?: string }).code === "ServiceUnavailable");

    if (isUnreachable) {
      console.warn("[Neo4j] AuraDB unreachable (ENOTFOUND / ServiceUnavailable). Using local data fallback.");
    } else {
      console.error("Neo4j session execution error:", error);
    }
    return null;
  } finally {
    await session.close();
  }
}

export async function verifyNeo4jConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  const d = getNeo4jDriver();
  if (!d) {
    return {
      connected: false,
      message: "Neo4j environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD) are not set.",
    };
  }

  try {
    const info = await d.getServerInfo();
    return {
      connected: true,
      message: `Connected to Neo4j server: ${info.agent || "Neo4j"} (${info.address || "remote"})`,
    };
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Unknown connection error",
    };
  }
}
