import db, { DB_TX } from "@common/db/client";
import { attachments } from "@pingxy/shared/domain";
import { UUID } from "crypto";

export const AttachmentRepository = {
  insert: async ({
    attachmentId,
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
    messageId: number;
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
};
