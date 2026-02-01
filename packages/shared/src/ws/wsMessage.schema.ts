import { z } from "zod";
import { wsMessageRequestPayload, wsMessageResponsePayload } from '../domain/message/message.schema';
import { wsUsersOnline } from "../domain/user/user.schema";
import { MessageReceiptRequestSchema } from '../domain/message-receipt/message-receipt.schema'

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
  "receipts.mark_all_read",
]);



const createEnvelope = <
  const Type extends z.infer<typeof wsEnum>,
  T extends z.ZodTypeAny,
>(
  type: Type,
  payloadSchema: T,
) =>
  z.object({
    id: z.uuid(),
    type: z.literal(type),
    payload: payloadSchema,
  });

export const ClientPayloadSchema = z.discriminatedUnion("type", [
  createEnvelope("message.new", wsMessageRequestPayload),
  createEnvelope("message.update", wsMessageRequestPayload),
  createEnvelope("message.delete", wsMessageRequestPayload),
  createEnvelope("receipt.sent", MessageReceiptRequestSchema),
  createEnvelope("receipt.delivered", MessageReceiptRequestSchema),
  createEnvelope("receipt.read", MessageReceiptRequestSchema),
  createEnvelope("receipt.failed", MessageReceiptRequestSchema),
]);

export const ServerEventSchema = z.discriminatedUnion("type", [
  createEnvelope("message.new", wsMessageResponsePayload),
  createEnvelope("message.update", wsMessageResponsePayload),
  createEnvelope("message.delete", wsMessageResponsePayload),
  createEnvelope("user.online", wsUsersOnline),
]);



//TODO: Implement PROPER GENERIC SCHEMA

// // 1. Define your Payloads clearly
// export const wsMessageRequestPayload = z.object({
//   message: z.object({
//     conversation_id: z.number(),
//     client_message_id: z.string(),
//     content: z.string(),
//     message_type: z.enum(["text", "image", "video", "file"]),
//     sender_id: z.number(),
//   }),
//   recipient: z.object({ id: z.number(), username: z.string() }),
// });

// export const wsMessageResponsePayload = z.object({
//   message: selectMessageSchema, // The one we fixed with z.coerce.date()
//   receipt: selectMessageReceiptSchema.optional(),
//   conversation_id: z.number(),
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
