import { z } from "zod";

import {
  receiptEventSchema,
  updateAllReceiptReqSchema,
  updateReceiptReqSchema,
} from "../domain/message-receipt/message-receipt.schema";

import {
  messageCreatedSchema,
  messageCreateSchema,
} from "../domain/message/message.schema";

import { openConversationSchema } from "../domain/conversation/conversation.schema";

import { userUnblockedSchema } from "../domain/blocked-user/blocked-user.schema";
import {
  userConnectedSchema,
  userConnectSchema,
  userDisconnectedSchema,
  userDisconnectSchema,
  userLoggedInSchema,
  userLoggedOutSchema,
  userLogoutSchema,
  usersList,
} from "../domain/user/user.schema";

import { presenceEventSchema, presenceRequestSchema, typingEventSchema, typingRequestSchema } from "../domain/ux/ux.schema";

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
  updateReceiptReqSchema,
  updateAllReceiptReqSchema,
  openConversationSchema,
  userConnectSchema,
  userDisconnectSchema,
  userLogoutSchema,
  typingRequestSchema,
  presenceRequestSchema,
]);

export const ServerEventSchema = z.discriminatedUnion("type", [
  serverErrorSchema,
  messageCreatedSchema,
  usersList,
  userConnectedSchema,
  userDisconnectedSchema,
  receiptEventSchema,
  userLoggedInSchema,
  userLoggedOutSchema,
  userUnblockedSchema,
  typingEventSchema,
  presenceEventSchema
]);
