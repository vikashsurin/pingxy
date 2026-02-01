import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { messages } from "./message.table";
import { z } from "zod";
import { selectMessageReceiptSchema } from "../message-receipt/message-receipt.schema";

export const messageInsertSchema = createInsertSchema(messages);
export const db_messageInsertSchema = createInsertSchema(messages);
export const dbSelectMessageSchema = createSelectSchema(messages);
export const selectMessageSchema = createSelectSchema(messages, {
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable(),
});

export const wsMessageRequestPayload = z.object({
  message: z.object({
    conversation_id: z.number(),
    client_message_id: z.string(),
    content: z.string(),
    message_type: z.enum(["text", "image", "video", "file"]),
    sender_id: z.number(),
  }),
  conversation_id: z.number(),
  recipient: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

// Todo: check if message receipt schema is needed
export const wsMessageResponsePayload = z.object({
  message: selectMessageSchema,
  receipt: selectMessageReceiptSchema,
  conversation_id: z.number(),
  recipient: z.object({
    id: z.number(),
    username: z.string(),
  }),
});
