import db, { DB_TX } from "@common/db/client";
import { attachments } from "@pingxy/shared/domain";

export const AttachmentRepository = {
  insert: async ({
    key,
    url,
    fileName,
    fileSize,
    mimeType,
    uploadedBy,
    tx = db,
  }: {
    key: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: number;
    tx?: DB_TX;
  }) => {
    return await tx
      .insert(attachments)
      .values({
        attachmentId: key,
        url: url,
        fileName: fileName,
        fileSize: fileSize,
        mimeType: mimeType,
        uploadedBy: uploadedBy,
      })
      .returning();
  },
};
