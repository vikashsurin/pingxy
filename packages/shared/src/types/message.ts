import * as schema from "../db/schemas";
import z from "zod";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { receiptInsertSchema, receiptSelectSchema } from './message_receipt';

export const messageInsertSchema = createInsertSchema(schema.messages);
export const messageSelectSchema = createSelectSchema(schema.messages);
export const messageUpdateSchema = createUpdateSchema(schema.messages);

export type Message = typeof schema.messages.$inferSelect;
export type NewMessage = typeof schema.messages.$inferInsert;
export type UpdateMessage = Partial<typeof schema.messages.$inferInsert>;

export type MessageReaction = typeof schema.message_reactions.$inferSelect;
export type NewMessageReaction = typeof schema.message_reactions.$inferInsert;
export type UpdateMessageReaction = Partial<
  typeof schema.message_reactions.$inferInsert
>;

const messageType = z.enum([
  "system",
  "message",
  "user_join",
  "user_leave",
  "new_conversation",
  "open_conversation",
  "mark_all_as_read",
  "mark_as_delivered",
  "message_delivered",
  "receipt_update",
  "message_read",
  "mark_as_read",
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
  msgData: z
    .object({
      message: z.union([messageInsertSchema, messageSelectSchema]).optional(),
      // TODO: update this to only use arrays.
      receipt: z
        .union([
          receiptInsertSchema,
          receiptSelectSchema,
          z.array(receiptInsertSchema),
          z.array(receiptSelectSchema),
        ])
        .optional(),
    })
    .optional(),
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
