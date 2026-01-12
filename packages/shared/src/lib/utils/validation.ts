import * as schema from "../../../../../apps/backend/src/core/db/schema";
import z from "zod";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const userInsertSchema = createInsertSchema(schema.users);
export const userSelectSchema = createSelectSchema(schema.users);
export const userUpdateSchema = createUpdateSchema(schema.users);


export const receiptInsertSchema = createInsertSchema(schema.message_receipts)
export const receiptSelectSchema = createSelectSchema(schema.message_receipts)
export const receiptUpdateSchema = createUpdateSchema(schema.message_receipts)



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

export const messageInsertSchema = createInsertSchema(schema.messages);
export const messageSelectSchema = createSelectSchema(schema.messages);
export const messageUpdateSchema = createUpdateSchema(schema.messages);

export type User = typeof schema.users.$inferSelect;
export type PublicUser = Omit<User, "hashed_password"> & {
  data: {
    gender: string;
    age: number;
    country: string;
    roles: string[];
  };
};
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

const messageType = z.enum([
  "system",
  "message",
  "user_join",
  "user_leave",
  "new_conversation",
  "open_conversation",
  'mark_all_as_read',
  'mark_as_delivered',
  'message_delivered',
  'receipt_update',
  'message_read',
  'mark_as_read',
  "notification",
  "subscribe",
  "unsubscribe",
  "users_online",
  "user_online",
  "user_offline",
  "message_receipt",
  "typing",
  "error",
]);

export const messagePayloadSchema = z.object({
  id: z.uuid(),
  type: messageType,
  recipient: z
    .object({
      id: z.number().optional(),
      username: z.string().min(1).max(100).optional(),
      avatarUrl: z.url().optional(),
    })
    .optional(),
  msgData: z.object({
    message: z.union([messageInsertSchema, messageSelectSchema]).optional(),
    // TODO: update this to only use arrays.
    receipt: z.union([
      receiptInsertSchema,
      receiptSelectSchema,
      z.array(receiptInsertSchema),
      z.array(receiptSelectSchema)
    ]).optional()
  }).optional(),
  data: z
    .object({
      conversation_id: z.number().optional(),
      message_id: z.number().optional(),
      user_id: z.number().optional(),
      users: z.any().optional(),
    })
    .optional(),
});

export type MessagePayload = z.infer<typeof messagePayloadSchema>;
