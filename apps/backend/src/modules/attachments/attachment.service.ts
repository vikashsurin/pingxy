import { uploadToStorage } from "@common/utils/s3/service";
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
  }: {
    attachments: any[];
    userId: number;
    messageId: number;
  }) => {

    if (!attachments || attachments.length === 0) return [];

    for (const a of attachments) {
      a.messageId = messageId;
      a.uploadedBy = userId;
    }
    const result = await AttachmentRepository.bulkInsert({ allAttachments: attachments });

    console.log("result from attachment service", result)
    return result
  },
};
