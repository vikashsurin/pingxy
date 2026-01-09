import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// 1. Create a global variable to store the connection
const globalForDb = globalThis as unknown as {
  conn: SQL | undefined;
};

// 2. Reuse existing connection if it exists, otherwise create a new one
// Bun.SQL handles the connection pooling internally
const client = globalForDb.conn ?? new SQL(process.env.DATABASE_URL);

// 3. In development, save the connection to the global object
if (process.env.NODE_ENV !== 'production') globalForDb.conn = client;

// 4. Export the Drizzle instance
export const db = drizzle({ client });
export default db;
