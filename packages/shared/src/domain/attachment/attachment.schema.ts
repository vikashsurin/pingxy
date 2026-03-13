import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { attachments } from "./attachment.table";

export const DBattachmentInsertSchema = createInsertSchema(attachments);
export const attachmentInsertSchema = createInsertSchema(attachments).pick({
  key: true,
  thumbKey: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  messageId: true,
  uploadedBy: true
});
export const attachmentResponseSchema = createSelectSchema(attachments, {
  createdAt: z.coerce.date(),
}).extend({
  url: z.string(),
  thumbUrl: z.string().optional()
});
