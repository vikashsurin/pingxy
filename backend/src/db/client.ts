import { Database } from "bun:sqlite";

// Initialize and export the shared database instance
export const db = new Database("chat.db");

export default db;
