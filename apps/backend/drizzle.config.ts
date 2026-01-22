import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../../packages/shared/src/db/schemas/*.ts",
  out: "./drizzle",
  dialect: "postgresql", // This tells Drizzle Kit how to write the SQL
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
