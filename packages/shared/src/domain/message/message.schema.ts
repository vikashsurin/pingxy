import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/socket-events";
import { selectMessageReceiptSchema } from "../message-receipt/message-receipt.schema";
import { messages } from "./message.table";
import { selectUserSchema } from "../user/user.schema";

// export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const updateMessageSchema = createUpdateSchema(messages);

export const dbMessageInsertSchema = createInsertSchema(messages).pick({
  conversationId: true,
  clientMessageId: true,
  content: true,
  senderId: true,
});
export const dbSelectMessageSchema = createSelectSchema(messages);

export const InsertMessageSchema = createInsertSchema(messages)
  .pick({
    clientMessageId: true,
    content: true,
    senderId: true,
  })
  .extend({
    conversationId: z.number().nullable(),
  });

export const messageCreateSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.MESSAGES.CREATE),
  payload: z.object({
    message: InsertMessageSchema,
    conversationId: z.number().nullable(),
    sender: selectUserSchema,
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});

export const messageCreatedSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.MESSAGES.CREATED),
  payload: z.object({
    message: selectMessageSchema,
    receipt: selectMessageReceiptSchema,
    conversationId: z.number(),
    sender: selectUserSchema,
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});
