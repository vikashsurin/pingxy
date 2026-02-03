import { z } from 'zod';
import { clientMessageReceiptSchema, dbInsertMessageReceiptSchema, insertReceiptSchema, selectMessageReceiptSchema, selectReceiptSchema, serveReceiptStatusSchema, wsReceiptPayload } from './message-receipt.schema';

export type InsertReceiptType = z.infer<typeof insertReceiptSchema>;
export type SelectReceiptType = z.infer<typeof selectReceiptSchema>;

export type MessageReceipt = z.infer<typeof selectMessageReceiptSchema>;
export type ReceiptPayloadType = z.infer<typeof wsReceiptPayload>

export type ClientMessageReceiptType = z.infer<typeof clientMessageReceiptSchema>;

export type ServerReceiptStatusType = z.infer<typeof serveReceiptStatusSchema>;

export type DBInsertMessageReceiptType = z.infer<typeof dbInsertMessageReceiptSchema>;
