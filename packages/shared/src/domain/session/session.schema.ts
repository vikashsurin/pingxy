import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sessions } from './session.table'

export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);
