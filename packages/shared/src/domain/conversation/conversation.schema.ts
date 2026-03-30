import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { DOMAIN_EVENTS } from "../../constants/index";
import { conversations } from "./conversation.table";

export const insertConversationSchema = createInsertSchema(conversations);
export const selectConversationSchema = createSelectSchema(conversations);

// export const wsTypingPayload = z.object({
//   conversationId: z.number(),
//   user: z.object({
//     id: z.number(),
//     username: z.string(),
//   }),
// });

// export const openConversationSchema = z.object({
//   id: z.uuid(),
//   type: z.literal(DOMAIN_EVENTS.CONVERSATIONS.OPEN),
//   payload: z.object({
//     conversationId: z.number(),
//     userId: z.number(),
//   }),
// });

export const createGroupReqSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.CONVERSATIONS.CREATE),
  payload: z.object({
    name: z.string(),
    isPrivate: z.boolean(),
    maxParticipants: z.number().optional(),
    description: z.string().optional(),
  }),
});

export const createGroupResSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.CONVERSATIONS.CREATE),
  payload: z.object({
    id: z.number(),
    name: z.string(),
    isPrivate: z.boolean(),
    maxParticipants: z.number().optional(),
    description: z.string().optional(),
    createdBy: z.number(),
  }),
});
