import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import neo4j, { type Driver } from "neo4j-driver";

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Load .env.local / .env from the repo root without overriding real env vars. */
export function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) continue;
    for (const raw of fs.readFileSync(fullPath, "utf-8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

export function createDriver(): { driver: Driver; database: string } {
  loadEnv();
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME || "neo4j";
  const password = process.env.NEO4J_PASSWORD;
  if (!uri || !password) {
    throw new Error("NEO4J_URI and NEO4J_PASSWORD must be set (see .env.example).");
  }
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    // Plain JS numbers instead of neo4j Integer objects.
    disableLosslessIntegers: true,
  });
  return { driver, database: process.env.NEO4J_DATABASE || "neo4j" };
}

export function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relPath), "utf-8")) as T;
}
