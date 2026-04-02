import z from "zod";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/index";

export const pingRequestSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.PING),
  payload: z.object({
    ping: z.boolean(),
  }),
});

export const pingEventSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.PING),
  payload: z.object({
    userId: z.number(),
    pong: z.boolean(),
  }),
});
