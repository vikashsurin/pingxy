import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { messageReactions } from "./message-reaction.table";

export const messageReactionInsertSchema = createInsertSchema(messageReactions);
export const messageReactionSelectSchema = createSelectSchema(messageReactions);
