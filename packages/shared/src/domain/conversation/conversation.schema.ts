import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { conversations } from './conversation.table'
import { DOMAIN_EVENTS } from "../../constants/index";

export const insertConversationSchema = createInsertSchema(conversations)
export const selectConversationSchema = createSelectSchema(conversations);

// export const wsTypingPayload = z.object({
//   conversationId: z.number(),
//   user: z.object({
//     id: z.number(),
//     username: z.string(),
//   }),
// });

export const openConversationSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.CONVERSATIONS.OPEN),
  payload: z.object({
    conversationId: z.number(),
    userId: z.number(),
  })
})