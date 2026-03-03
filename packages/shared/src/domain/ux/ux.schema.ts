import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/index";
import { z } from "zod";

export const typingRequestSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.TYPING.START),
  payload: z.object({
    conversationId: z.number(),
    userId: z.number(),
  })
})

export const typingEventSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.TYPING.STARTED),
  payload: z.object({
    conversationId: z.number(),
    userId: z.number(),
  })
})
