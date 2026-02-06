import { z } from "zod";

import {
  messageCreateSchema,
  messageCreatedSchema,
} from "../domain/message/message.schema";
import { receiptReqSchema } from "../domain/message-receipt/message-receipt.schema";

export const ClientReqSchema = z.discriminatedUnion("type", [
  messageCreateSchema,
  receiptReqSchema
]);

export const ServerEventSchema = z.discriminatedUnion("type", [
  messageCreatedSchema,

]);
