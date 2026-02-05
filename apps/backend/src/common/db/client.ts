import { SQL } from "bun";
import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sql";
import { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { PgTransaction } from "drizzle-orm/pg-core";

// import * as schema from "@pingxy/shared/db/schemas";
import {
  blockedUsers,
  conversations,
  messageReactions,
  messageReceipts,
  messages,
  participants,
  refreshTokens,
  sessions,
  users,
} from "@pingxy/shared/domain";

export const schema = {
  users,
  blockedUsers,
  conversations,
  messageReactions,
  messageReceipts,
  messages,
  participants,
  refreshTokens,
  sessions,
};

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

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
  casing: "snake_case",
});

export default db;

export type DB_TX =
  | BunSQLDatabase<typeof schema>
  | PgTransaction<any, any, any>;
