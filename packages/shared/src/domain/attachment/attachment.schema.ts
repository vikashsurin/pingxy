import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { attachments } from "./attachment.table";

export const DBattachmentInsertSchema = createInsertSchema(attachments);
export const attachmentInsertSchema = createInsertSchema(attachments).pick({
  attachmentId: true,
  key: true,
  url: true,
  thumbnailUrl: true,
  thumbKey: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
});
export const attachmentSelectSchema = createSelectSchema(attachments);
