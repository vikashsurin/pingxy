import { createSelectSchema } from "drizzle-zod";
import { message_receipts } from "./message-receipt.table";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";




export const selectMessageReceiptSchema = createSelectSchema(message_receipts, {
  created_at: z.coerce.date(),
  delivered_at: z.coerce.date().nullable(),
  read_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date(),
});



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
