import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { refreshTokens } from "./refresh-token.table";

export const refreshTokenInsertSchema = createInsertSchema(refreshTokens);
export const refreshTokenSelectSchema = createSelectSchema(refreshTokens);
