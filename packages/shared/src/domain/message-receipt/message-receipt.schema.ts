import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { messageReceipts } from "./message-receipt.table";

export const insertReceiptSchema = createInsertSchema(messageReceipts);
export const selectReceiptSchema = createSelectSchema(messageReceipts);

export const selectMessageReceiptSchema = createSelectSchema(messageReceipts);

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

const wsMREnum = z.enum([
  "receipt.sent",
  "receipt.delivered",
  "receipt.read",
  "receipt.failed",
  "receipt.mark_all_read",
]);

export const clientMessageReceiptSchema = z.object({
  id: z.uuid(),
  type: wsMREnum,
  payload: z.object({
    conversationId: z.number(),
    messageId: z.number().optional(),
    userId: z.number(),
    recipient: z.object({
      id: z.number(),
    }),
  }),
});

export const serveReceiptStatusSchema = z.object({
  id: z.uuid(),
  type: wsMREnum,
  payload: z.object({
    receipts: z.union([z.array(selectMessageReceiptSchema)]),
  }),
});

type K = z.infer<typeof selectMessageReceiptSchema>;
