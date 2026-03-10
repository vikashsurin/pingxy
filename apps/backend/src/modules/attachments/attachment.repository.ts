import db, { DB_TX } from "@common/db/client";
import { attachments } from "@pingxy/shared/domain";
import { attachmentInsertSchema } from "@pingxy/shared/domain/attachment/attachment.schema";
import { UUID } from "crypto";
import z from "zod";

export const AttachmentRepository = {
  insert: async ({
    attachmentId,
    conversationId,
    key,
    url,
    thumbnailUrl,
    thumbKey,
    messageId,
    fileName,
    fileSize,
    mimeType,
    uploadedBy,
    tx = db,
  }: {
    attachmentId: string;
    messageId?: number;
    conversationId?: number;
    key: string;
    url: string;
    thumbKey: string | null;
    thumbnailUrl: string | null;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: number;
    tx?: DB_TX;
  }) => {
    return await tx
      .insert(attachments)
      .values({
        attachmentId: attachmentId,
        messageId: messageId,
        conversationId: conversationId,
        key: key,
        url: url,
        fileName: fileName,
        thumbKey: thumbKey,
        thumbnailUrl: thumbnailUrl,
        fileSize: fileSize,
        mimeType: mimeType,
        uploadedBy: uploadedBy,
      })
      .returning();
  },

  bulkInsert: async ({
    allAttachments,
    tx = db,
  }: {
    allAttachments: z.infer<typeof attachmentInsertSchema>[];
    tx?: DB_TX;
  }) => {
    return await tx
      .insert(attachments)
      .values(allAttachments)
      .returning();
  },
};
