import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/index";
import { z } from "zod";

export const typingRequestSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.TYPING.START),
  payload: z.object({
    conversationId: z.number(),
    userId: z.number(),
  }),
});

export const typingEventSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.TYPING.STARTED),
  payload: z.object({
    conversationId: z.number(),
    userId: z.number(),
  }),
});

export const presenceRequestSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.PRESENCE.ONLINE),
  payload: z.object({
    conversationId: z.number(),
    of: z.number(),
    for: z.number(),
  }),
});

export const presenceEventSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.PRESENCE.ONLINE),
  payload: z.object({
    conversationId: z.number(),
    of: z.number(),
    for: z.number(),
    online: z.boolean().optional(),
    lastSeenAt: z.coerce.date().optional(),
  }),
});

export const reqHeartbeatSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.HEARTBEAT),
  payload: z.object({
    ping: z.boolean()
  }),
});

export const resHeartbeatSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.HEARTBEAT),
  payload: z.object({
    userId: z.number(),
    pong: z.boolean()
  }),
});

export const reqSubscriptionPresenceSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.SUBSCRIPTION.PRESENCE),
  payload: z.object({
    userId: z.number(),
  }),
})

