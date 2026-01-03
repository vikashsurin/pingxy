import * as schema from "../../../../../apps/backend/src/db/schema/index";

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type UpdateUser = Partial<typeof schema.users.$inferInsert>;

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

export type Message = typeof schema.messages.$inferSelect;
export type NewMessage = typeof schema.messages.$inferInsert;
export type UpdateMessage = Partial<typeof schema.messages.$inferInsert>;

export type MessageReceipt = typeof schema.message_receipts.$inferSelect;
export type NewMessageReceipt = typeof schema.message_receipts.$inferInsert;
export type UpdateMessageReceipt = Partial<
  typeof schema.message_receipts.$inferInsert
>;

export type MessageReaction = typeof schema.message_reactions.$inferSelect;
export type NewMessageReaction = typeof schema.message_reactions.$inferInsert;
export type UpdateMessageReaction = Partial<
  typeof schema.message_reactions.$inferInsert
>;

export type BlockedUser = typeof schema.blocked_users.$inferSelect;
export type NewBlockedUser = typeof schema.blocked_users.$inferInsert;
export type UpdateBlockedUser = Partial<
  typeof schema.blocked_users.$inferInsert
>;

export type RefreshToken = typeof schema.refresh_tokens.$inferSelect;
export type NewRefreshToken = typeof schema.refresh_tokens.$inferInsert;
export type UpdateRefreshToken = Partial<
  typeof schema.refresh_tokens.$inferInsert
>;

export type Session = typeof schema.sessions.$inferSelect;
export type NewSession = typeof schema.sessions.$inferInsert;
export type UpdateSession = Partial<typeof schema.sessions.$inferInsert>;
