import { z } from "zod";

import {
  receiptEventSchema,
  receiptReqSchema,
} from "../domain/message-receipt/message-receipt.schema";

import {
  messageCreateSchema,
  messageCreatedSchema,
} from "../domain/message/message.schema";

import { openConversationSchema } from "../domain/conversation/conversation.schema";

import {
  userConnectedSchema,
  userDisconnectedSchema,
  usersList,
} from "../domain/user/user.schema";

export const serverErrorSchema = z.object({
  id: z.uuid(),
  type: z.literal("event:error.system"),
  payload: z.object({
    message: z.string(),
    issues: z.array(z.any()).optional(),
  }),
});

export const ClientReqSchema = z.discriminatedUnion("type", [
  messageCreateSchema,
  receiptReqSchema,
  openConversationSchema,
]);

export const ServerEventSchema = z.discriminatedUnion("type", [
  serverErrorSchema,
  messageCreatedSchema,
  usersList,
  userConnectedSchema,
  userDisconnectedSchema,
  receiptEventSchema,
]);
