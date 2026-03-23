import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/socket-events";
import { participants } from "./participant.table";

export const participantInsertSchema = createInsertSchema(participants);
export const participantSelectSchema = createSelectSchema(participants, {
  lastReadAt: z.coerce.date().nullable(),
  lastDeliveredAt: z.coerce.date().nullable(),
}).pick({
  id: true,
  role: true,
  userId: true,
  conversationId: true,
  lastDeliveredAt: true,
  lastDeliveredMessageId: true,
  lastReadAt: true,
  lastReadMessageId: true,
  unreadCount: true
});


export const updatePartReqSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.PARTICIPANTS.UPDATE),
  payload: z.object({
    conversationId: z.number(),
    lastReadMessageId: z.number().optional(),
    lastDeliveredMessageId: z.number().optional(),
    senderId: z.number()
  })
});
export const updatePartResSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.PARTICIPANTS.UPDATED),
  payload: z.object({
    id: z.number(),
    userId: z.number(),
    conversationId: z.number(),
    lastReadMessageId: z.number().optional(),
    lastReadAt: z.coerce.date().optional(),
    lastDeliveredMessageId: z.number().optional(),
    lastDeliveredAt: z.coerce.date().optional(),
    senderId: z.number()
  })
});
