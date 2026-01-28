import * as schema from "../db/schemas";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const receiptInsertSchema = createInsertSchema(schema.message_receipts);
export const receiptSelectSchema = createSelectSchema(schema.message_receipts);
export const receiptUpdateSchema = createUpdateSchema(schema.message_receipts);

export type MessageReceipt = typeof schema.message_receipts.$inferSelect;
export type NewMessageReceipt = typeof schema.message_receipts.$inferInsert;
export type UpdateMessageReceipt = Partial<
  typeof schema.message_receipts.$inferInsert
>;
