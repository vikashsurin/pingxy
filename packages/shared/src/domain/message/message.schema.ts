import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { messages } from "./message.table";
import { z } from "zod";

export const messageInsertSchema = createInsertSchema(messages);
export const db_messageInsertSchema = createInsertSchema(messages)

const wsMessageType = z.enum([
  'system.notification',
  'system.error',

  'connection.subscribe',
  'connection.unsubscribe',

  'user.join',
  'user.leave',
  'user.online',
  'user.offline',
  'users.online',

  'conversation.new',
  'conversation.open',

  'message.new',
  'message.update',
  'message.delete',

  'typing.start',
  'typing.stop',

  'receipt.sent',
  'receipt.delivered',
  'receipt.read',
  'receipt.failed',

  'receipts.mark_all_delivered',
  'receipts.mark_all_read',
]);


export const wsMessagePayload = z.object({
  message: messageInsertSchema,
  conversation_id: z.number(),
  recipient: z.object({
    id: z.number(),
    username: z.string(),
  }),
})

export const wsTypingPayload = z.object({
  conversation_id: z.number(),
  user: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

export const wsReceiptPayload = z.object({
  message_id: z.number(),
  user_id: z.number(),
  status: z.enum(['delivered', 'read']),
  timestamp: z.date(),
});

const createEnvelope = <T extends z.ZodTypeAny>(
  type: string,
  payloadSchema: T
) =>
  z.object({
    id: z.uuid(),
    type: z.literal(type),
    timestamp: z.date(),
    payload: payloadSchema,
  });

export const wsMessageEnvelope = z.discriminatedUnion('type', [
  createEnvelope('message.new', wsMessagePayload),
  createEnvelope('message.update', wsMessagePayload),
  createEnvelope('message.delete', wsMessagePayload),
]);
