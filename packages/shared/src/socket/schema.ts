import { z } from "zod";

import {
  messageCreatedSchema,
  messageCreateSchema,
} from "../domain/message/message.schema";

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

import {
  pingEventSchema,
  pingRequestSchema,
} from "../domain/system/system.schema";
import {
  createGroupReqSchema,
  createGroupResSchema,
} from "../domain/conversation/conversation.schema";
import {
  updatePartReqSchema,
  updatePartResSchema,
} from "../domain/participant/participant.schema";
import {
  presenceEventSchema,
  presenceRequestSchema,
  reqHeartbeatSchema,
  resHeartbeatSchema,
  typingEventSchema,
  typingRequestSchema,
} from "../domain/ux/ux.schema";

export const serverErrorSchema = z.object({
  id: z.uuid(),
  type: z.literal("event:error.system"),
  payload: z.object({
    message: z.string(),
    issues: z.array(z.any()).optional(),
  }),
});

export const ClientReqSchema = z.discriminatedUnion("type", [
  pingRequestSchema,
  messageCreateSchema,
  userConnectSchema,
  userDisconnectSchema,
  userLogoutSchema,
  typingRequestSchema,
  presenceRequestSchema,
  updatePartReqSchema,
  reqHeartbeatSchema,
  createGroupReqSchema,
]);

export const ServerEventSchema = z.discriminatedUnion("type", [
  pingEventSchema,
  serverErrorSchema,
  messageCreatedSchema,
  usersList,
  userConnectedSchema,
  userDisconnectedSchema,
  userLoggedInSchema,
  userLoggedOutSchema,
  userUnblockedSchema,
  typingEventSchema,
  presenceEventSchema,
  updatePartResSchema,
  resHeartbeatSchema,
  createGroupResSchema,
]);
