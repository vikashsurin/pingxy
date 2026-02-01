import { createSelectSchema } from "drizzle-zod";
import { message_receipts } from "./message-receipt.table";
import { z } from "zod";

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
