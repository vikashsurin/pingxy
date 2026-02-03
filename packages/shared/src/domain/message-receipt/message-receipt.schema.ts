import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { message_receipts } from "./message-receipt.table";



export const insertReceiptSchema = createInsertSchema(message_receipts)
export const selectReceiptSchema = createSelectSchema(message_receipts)

export const selectMessageReceiptSchema = createSelectSchema(message_receipts, {
  created_at: z.coerce.date(),
  delivered_at: z.coerce.date().nullable(),
  read_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date(),
});

export const dbInsertMessageReceiptSchema = createInsertSchema(message_receipts)

export const wsReceiptPayload = z.object({
  message_id: z.number(),
  user_id: z.number(),
  status: z.enum(["delivered", "read"]),
});


export const messageReceiptInsertSchema = createInsertSchema(message_receipts)
export const MessageReceiptRequestSchema = z.object({
  recipient: z.object({
    id: z.number()
  })
})


export const clientInsertMessageReceiptSchema = createInsertSchema(message_receipts).pick({
  conversation_id: true,
  message_id: true,
  user_id: true,
})

export const clientUpdateMessageReceiptSchema = createUpdateSchema(message_receipts).pick({
  conversation_id: true,
  message_id: true,
  user_id: true,
})


export const insertMessageReceiptSchema = createInsertSchema(message_receipts).pick({
  conversation_id: true,
  message_id: true,
  user_id: true,
})


const wsMREnum = z.enum([
  "receipt.sent",
  "receipt.delivered",
  "receipt.read",
  "receipt.failed",
  "receipts.mark_all_read"
])

export const clientMessageReceiptSchema = z.object({
  id: z.uuid(),
  type: wsMREnum,
  payload: z.object({
    conversation_id: z.number(),
    message_id: z.number().optional(),
    user_id: z.number(),
    recipient: z.object({
      id: z.number()
    })
  })
})


export const serveReceiptStatusSchema = z.object({
  id: z.uuid(),
  type: "receipt.update.status",
  payload: z.object({
    receipts: z.union([
      z.array(selectMessageReceiptSchema)
    ])
  })
})
