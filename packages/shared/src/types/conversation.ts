import * as schema from "../db/schemas";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const conversationInsertSchema = createInsertSchema(
  schema.conversations
);
export const conversationSelectSchema = createSelectSchema(
  schema.conversations
);
export const conversationUpdateSchema = createUpdateSchema(
  schema.conversations
);

export const participantInsertSchema = createInsertSchema(schema.participants);
export const participantSelectSchema = createSelectSchema(schema.participants);
export const participantUpdateSchema = createUpdateSchema(schema.participants);

export type Conversation = typeof schema.conversations.$inferSelect;
export type NewConversation = typeof schema.conversations.$inferInsert;
export type UpdateConversation = Partial<
  typeof schema.conversations.$inferInsert
>;

export type Participant = typeof schema.participants.$inferSelect;
export type NewParticipant = typeof schema.participants.$inferInsert;
export type UpdateParticipant = Partial<
  typeof schema.participants.$inferInsert
>;
