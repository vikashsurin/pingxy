import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/socket-events";
import { messageReceipts } from "./message-receipt.table";

export const insertReceiptSchema = createInsertSchema(messageReceipts);
export const selectReceiptSchema = createSelectSchema(messageReceipts);

export const selectMessageReceiptSchema = createSelectSchema(messageReceipts, {
  createdAt: z.coerce.date(),
  deliveredAt: z.coerce.date().nullable(),
  readAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
});

export const dbInsertMessageReceiptSchema = createInsertSchema(messageReceipts);

export const wsReceiptPayload = z.object({
  messageId: z.number(),
  userId: z.number(),
  status: z.enum(["delivered", "read"]),
});

export const messageReceiptInsertSchema = createInsertSchema(messageReceipts);
export const MessageReceiptRequestSchema = z.object({
  recipient: z.object({
    id: z.number(),
  }),
});

export const clientInsertMessageReceiptSchema = createInsertSchema(
  messageReceipts,
).pick({
  conversationId: true,
  messageId: true,
  userId: true,
});

export const clientUpdateMessageReceiptSchema = createUpdateSchema(
  messageReceipts,
).pick({
  conversationId: true,
  messageId: true,
  userId: true,
});

export const insertMessageReceiptSchema = createInsertSchema(
  messageReceipts,
).pick({
  conversationId: true,
  messageId: true,
  userId: true,
});

const reqEnums = z.enum([
  DOMAIN_EVENTS.RECEIPTS.SENT,
  DOMAIN_EVENTS.RECEIPTS.DELIVER,
  DOMAIN_EVENTS.RECEIPTS.READ,
  DOMAIN_EVENTS.RECEIPTS.FAIL,
  DOMAIN_EVENTS.RECEIPTS.ALL_READ,
  DOMAIN_EVENTS.RECEIPTS.ALL_DELIVER,
]);
const eventEnums = z.enum([
  SERVER_EVENTS.RECEIPTS.SENT,
  SERVER_EVENTS.RECEIPTS.DELIVERED,
  SERVER_EVENTS.RECEIPTS.READ,
  SERVER_EVENTS.RECEIPTS.FAILED,
  SERVER_EVENTS.RECEIPTS.ALL_READ,
  SERVER_EVENTS.RECEIPTS.ALL_DELIVERED,
]);

export const receiptReqSchema = z.object({
  id: z.uuid(),
  type: reqEnums,
  payload: z.object({
    conversationId: z.number(),
    messageId: z.number().optional(),
    userId: z.number(),
    sender: z.object({
      id: z.number(),
    }),
  }),
});

export type LL = z.infer<typeof receiptReqSchema>;
export const receiptEventSchema = z.object({
  id: z.uuid(),
  type: eventEnums,
  payload: z.object({
    receipts: z.array(selectMessageReceiptSchema).optional(),
    recipient: z.object({
      id: z.number(),
    }),
  }),
});

type K = z.infer<typeof selectMessageReceiptSchema>;
