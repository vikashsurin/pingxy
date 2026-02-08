import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sessions } from './session.table'

export const sessionInsertSchema = createInsertSchema(sessions);
export const sessionSelectSchema = createSelectSchema(sessions);
