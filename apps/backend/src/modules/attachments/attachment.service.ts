import { uploadToStorage } from "@common/utils/s3/service";
import { attachmentInsertSchema } from "@pingxy/shared/domain/attachment/attachment.schema";
import z from "zod";
import { AttachmentRepository } from "./attachment.repository";

export const AttachmentService = {
  uploadToStorage: async ({ file, userId }: { file: File; userId: number }) => {
    // 1. Check file size
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File too large");
    }

    // 2. Upload the file
    const { attachmentId, key, url, thumbKey, thumbnailUrl } =
      await uploadToStorage(file);

    return { attachmentId, key, url, thumbKey, thumbnailUrl };
  },
  createAttachment: async ({
    attachments,
    userId,
    messageId,
    conversationId,
  }: {
    attachments: z.infer<typeof attachmentInsertSchema>[];
    userId: number;
    messageId: number;
    conversationId: number;
  }) => {

    for (const a of attachments) {
      a.messageId = messageId;
      a.uploadedBy = userId;
      a.conversationId = conversationId;
    }
    const result = await AttachmentRepository.bulkInsert({ allAttachments: attachments });

    console.log("result from attachment service", result)
    return result
  },
};
