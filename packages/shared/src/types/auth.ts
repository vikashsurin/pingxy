import * as schema from "../db/schemas";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const sessionInsertSchema = createInsertSchema(schema.sessions);
export const sessionSelectSchema = createSelectSchema(schema.sessions);
export const sessionUpdateSchema = createUpdateSchema(schema.sessions);

export const refreshTokenInsertSchema = createInsertSchema(schema.refresh_tokens);
export const refreshTokenSelectSchema = createSelectSchema(schema.refresh_tokens);
export const refreshTokenUpdateSchema = createUpdateSchema(schema.refresh_tokens);

export type RefreshToken = typeof schema.refresh_tokens.$inferSelect;
export type NewRefreshToken = typeof schema.refresh_tokens.$inferInsert;
export type UpdateRefreshToken = Partial<
  typeof schema.refresh_tokens.$inferInsert
>;

export type Session = typeof schema.sessions.$inferSelect;
export type NewSession = typeof schema.sessions.$inferInsert;
export type UpdateSession = Partial<typeof schema.sessions.$inferInsert>;
