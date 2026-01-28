import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import * as schema from "@chat/shared/db/schemas";

// 0. Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// 1. Singleton pattern for Development HMR
const globalForDb = globalThis as unknown as {
  conn: SQL | undefined;
};

// 2. Production-optimized client
// We add 'max' to prevent connection exhaustion in containerized environments
const client =
  globalForDb.conn ??
  new SQL({
    url: process.env.DATABASE_URL,
    max: process.env.NODE_ENV === "production" ? 10 : undefined, // Keep it lean in prod
  });

if (process.env.NODE_ENV !== "production") globalForDb.conn = client;

// 3. Export Drizzle
export const db = drizzle({
  client,
  schema,
});

export default db;
