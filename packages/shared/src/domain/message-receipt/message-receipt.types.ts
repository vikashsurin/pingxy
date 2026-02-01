import { selectMessageReceiptSchema, wsReceiptPayload } from './message-receipt.schema';
import { z } from 'zod';

export type MessageReceipt = z.infer<typeof selectMessageReceiptSchema>;
export type ReceiptPayloadType = z.infer<typeof wsReceiptPayload>
