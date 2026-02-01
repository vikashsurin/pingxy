import { z } from "zod";
export const wsTypingPayload = z.object({
  conversation_id: z.number(),
  user: z.object({
    id: z.number(),
    username: z.string(),
  }),
});
