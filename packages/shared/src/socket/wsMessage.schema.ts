import { z } from "zod";
import {
  clientMessageReceiptSchema,
  serveReceiptStatusSchema,
} from "../domain/message-receipt/message-receipt.schema";
import {
  clientMessageSchema,
  serverMessageSchema,
} from "../domain/message/message.schema";
import { serverUsersOnlineSchema } from "../domain/user/user.schema";

const wsEnum = z.enum([
  "system",

  "connection.subscribe",
  "connection.unsubscribe",

  "user.join",
  "user.leave",
  "user.online",
  "user.offline",
  "users.online",

  "conversation.new",
  "conversation.open",

  "message.new",
  "message.update",
  "message.delete",

  "typing.start",
  "typing.stop",

  "receipt.sent",
  "receipt.delivered",
  "receipt.read",
  "receipt.failed",

  "receipts.mark_all_delivered",
  "receipt.mark_all_read",
]);

const messageEnums = z.enum([
  "message.create",
  "message.created",
  "message.update",
  "message.updated",
  "message.delete",
  "message.deleted",
]);

const receiptEnums = z.enum([
  "receipt.send",
  "receipt.sent",
  "receipt.delivered",
  "receipt.read",
  "receipt.failed",
  "receipts.all.delivered",
  "receipts.all.read",
]);

export const ClientPayloadSchema = z.discriminatedUnion("type", [
  clientMessageSchema,
  clientMessageReceiptSchema,
]);

export const ServerEventSchema = z.discriminatedUnion("type", [
  serverMessageSchema,
  serverUsersOnlineSchema,
  serveReceiptStatusSchema,
]);

//TODO: Implement PROPER GENERIC SCHEMA

// // 1. Define your Payloads clearly
// export const wsMessageRequestPayload = z.object({
//   message: z.object({
//     conversationId: z.number(),
//     clientMessageId: z.string(),
//     content: z.string(),
//     message_type: z.enum(["text", "image", "video", "file"]),
//     senderId: z.number(),
//   }),
//   recipient: z.object({ id: z.number(), username: z.string() }),
// });

// export const wsMessageResponsePayload = z.object({
//   message: selectMessageSchema, // The one we fixed with z.coerce.date()
//   receipt: selectMessageReceiptSchema.optional(),
//   conversationId: z.number(),
//   recipient: z.object({ id: z.number(), username: z.string() }),
// });

// // 2. The "Inbound" Schema (Client -> Server)
// export const ClientPayloadSchema = z.discriminatedUnion("type", [
//   createEnvelope("message.new", wsMessageRequestPayload),
//   createEnvelope("message.update", wsMessageRequestPayload),
//   // Add other client actions here, like "heartbeat" or "typing.start"
// ]);

// // 3. The "Outbound" Schema (Server -> Client)
// export const ServerEventSchema = z.discriminatedUnion("type", [
//   createEnvelope("message.new", wsMessageResponsePayload),
//   createEnvelope("message.update", wsMessageResponsePayload),
//   createEnvelope("receipt.sent", receiptPayload), // Now it fits perfectly!
// ]);
