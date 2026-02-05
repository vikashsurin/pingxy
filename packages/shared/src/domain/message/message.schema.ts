import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { optional, z } from "zod";
import { selectMessageReceiptSchema } from "../message-receipt/message-receipt.schema";
import { messages } from "./message.table";

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const updateMessageSchema = createUpdateSchema(messages);

export const dbMessageInsertSchema = createInsertSchema(messages);
export const dbSelectMessageSchema = createSelectSchema(messages);
// export const selectMessageSchema = createSelectSchema(messages, {
//   createdAt: z.coerce.date(),
//   updatedAt: z.coerce.date(),
//   deletedAt: z.coerce.date().nullable(),
// });

// Todo: check if message receipt schema is needed
export const wsMessageResponsePayload = z.object({
  message: selectMessageSchema,
  receipt: selectMessageReceiptSchema,
  conversationId: z.number(),
  recipient: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

export const clientInsertMessageSchema = insertMessageSchema
  .pick({
    clientMessageId: true,
    content: true,
    messageType: true,
    senderId: true,
  })
  .extend({
    conversationId: z.number().nullable(),
  });

export const clientMessageSchema = z.object({
  id: z.uuid(),
  type: z.literal("message.new"),
  payload: z.object({
    message: clientInsertMessageSchema,
    conversationId: z.number().nullable(),
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});

export const serverMessageSchema = z.object({
  id: z.uuid(),
  type: z.literal("message.new"),
  payload: z.object({
    message: selectMessageSchema,
    receipt: selectMessageReceiptSchema,
    conversationId: z.number(),
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});

export const serverUpdateMessageSchema = z.object({
  id: z.uuid(),
  type: z.literal("message.update"),
  payload: z.object({
    message: selectMessageSchema,
    receipt: selectMessageReceiptSchema,
    conversationId: z.number(),
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});
export const serverDeleteMessageSchema = z.object({
  id: z.uuid(),
  type: z.literal("message.delete"),
  payload: z.object({
    message: selectMessageSchema,
    receipt: selectMessageReceiptSchema,
    conversationId: z.number(),
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});
