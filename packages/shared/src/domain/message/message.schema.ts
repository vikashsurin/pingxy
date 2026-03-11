import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/socket-events";
import { attachmentInsertSchema, attachmentSelectSchema } from "../attachment/attachment.schema";
import { selectMessageReceiptSchema } from "../message-receipt/message-receipt.schema";
import { selectUserSchema } from "../user/user.schema";
import { messages } from "./message.table";


// export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
}).pick({
  id: true,
  conversationId: true,
  senderId: true,
  content: true,
  clientMessageId: true,
  createdAt: true
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

const fileSchema = z
  .instanceof(File)
  .optional()
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, {
    error: "File size must be less than 10MB",
  })
  .refine(
    (file) =>
      !file ||
      [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ].includes(file.type),
    {
      error: "Invalid file type",
    },
  );

export const messageCreateSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.MESSAGES.CREATE),
  payload: z.object({
    message: InsertMessageSchema,
    attachments: z.array(attachmentInsertSchema),
    conversationId: z.number().nullish(),
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
    message: selectMessageSchema.pick({
      id: true,
      conversationId: true,
      clientMessageId: true,
      content: true,
      createdAt: true,
      senderId: true,
    }),
    attachments: z.array(attachmentSelectSchema),
    receipt: selectMessageReceiptSchema,
    conversationId: z.number(),
    sender: selectUserSchema,
    recipient: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});
