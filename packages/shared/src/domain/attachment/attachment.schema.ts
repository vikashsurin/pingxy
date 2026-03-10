import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { attachments } from "./attachment.table";

export const attachmentInsertSchema = createInsertSchema(attachments);
export const attachmentSelectSchema = createSelectSchema(attachments, {
  createdAt: z.coerce.date(),
});
