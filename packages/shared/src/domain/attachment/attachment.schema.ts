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
});
export const attachmentSelectSchema = createSelectSchema(attachments);
