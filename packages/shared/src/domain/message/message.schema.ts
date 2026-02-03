import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from "drizzle-zod";
import { z } from "zod";
import { selectMessageReceiptSchema } from "../message-receipt/message-receipt.schema";
import { messages } from "./message.table";

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const updateMessageSchema = createUpdateSchema(messages);

export const db_messageInsertSchema = createInsertSchema(messages);
export const dbSelectMessageSchema = createSelectSchema(messages);
// export const selectMessageSchema = createSelectSchema(messages, {
//   created_at: z.coerce.date(),
//   updated_at: z.coerce.date(),
//   deleted_at: z.coerce.date().nullable(),
// });

// Todo: check if message receipt schema is needed
export const wsMessageResponsePayload = z.object({
  message: selectMessageSchema,
  receipt: selectMessageReceiptSchema,
  conversation_id: z.number(),
  recipient: z.object({
    id: z.number(),
    username: z.string(),
  }),
});



export const clientInsertMessageSchema = insertMessageSchema.pick({
  conversation_id: true,
  client_message_id: true,
  content: true,
  message_type: true,
  sender_id: true,

});


export const clientNewMessageSchema = z.object({
  id: z.uuid(),
  type: z.literal('message.new'),
  payload: z.object({
    message: clientInsertMessageSchema,
    conversation_id: z.number(),
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    })
  }),
})

export const serverNewMessageSchema = z.object({
  id: z.uuid(),
  type: z.literal('message.new'),
  payload: z.object({
    message: selectMessageSchema,
    receipt: selectMessageReceiptSchema,
    conversation_id: z.number(),
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    })
  }),
})
export const serverUpdateMessageSchema = z.object({
  id: z.uuid(),
  type: z.literal('message.update'),
  payload: z.object({
    message: selectMessageSchema,
    receipt: selectMessageReceiptSchema,
    conversation_id: z.number(),
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    })
  }),
})
export const serverDeleteMessageSchema = z.object({
  id: z.uuid(),
  type: z.literal('message.delete'),
  payload: z.object({
    message: selectMessageSchema,
    receipt: selectMessageReceiptSchema,
    conversation_id: z.number(),
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    })
  }),
})
