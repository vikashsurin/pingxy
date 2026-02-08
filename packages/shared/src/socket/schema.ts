import { z } from "zod";

import { receiptReqSchema } from "../domain/message-receipt/message-receipt.schema";

import {
    messageCreateSchema,
    messageCreatedSchema,
} from "../domain/message/message.schema";

import { usersOnlineSchema } from "../domain/user/user.schema";

export const ClientReqSchema = z.discriminatedUnion("type", [
  messageCreateSchema,
  receiptReqSchema,
]);

export const ServerEventSchema = z.discriminatedUnion("type", [
  messageCreatedSchema,
  usersOnlineSchema,
]);
