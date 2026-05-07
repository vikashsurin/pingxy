import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/socket-events";
import {
  attachmentReqSchema,
  attachmentResponseSchema,
} from "../attachment/attachment.schema";
import { selectUserSchema } from "../user/user.schema";
import { messages } from "./message.table";
import { participantSelectSchema } from "../participant/participant.schema";

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
  createdAt: true,
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
    attachments: z.array(attachmentReqSchema),
    conversationId: z.number().nullish(),
    recipient: z
      .object({
        id: z.number().nullish(),
        userName: z.string().nullish(),
      })
      .nullish(),
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
    }).extend({
      attachments: z.array(attachmentResponseSchema)
    }),
    attachments: z.array(attachmentResponseSchema),
    conversation: z.object({
      id: z.number(),
      name: z.string().nullable(),
      type: z.enum(["direct", "group"]),
      lastMessageId: z.number().nullable(),
      lastMessageAt: z.coerce.date().nullable(),
    }),
    sender: participantSelectSchema,
    participants: z.array(participantSelectSchema),
    // recipient: z.object({
    //   id: z.number(),
    //   userName: z.string(),
    // }),
  }),
});
