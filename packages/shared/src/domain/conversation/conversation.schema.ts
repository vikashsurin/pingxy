import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { conversations } from './conversation.table'

export const wsTypingPayload = z.object({
  conversation_id: z.number(),
  user: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

export const selectConversationSchema = createSelectSchema(conversations);
