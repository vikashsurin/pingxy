import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { conversations } from './conversation.table'

export const insertConversationSchema = createInsertSchema(conversations)
export const selectConversationSchema = createSelectSchema(conversations);

export const wsTypingPayload = z.object({
  conversation_id: z.number(),
  user: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

export const clientOpenConversationSchema = z.object({
  id: z.uuid(),
  type: z.literal('conversation.open'),
  payload: z.object({
    conversation_id: z.number(),
    user_id: z.number(),
  })
})
