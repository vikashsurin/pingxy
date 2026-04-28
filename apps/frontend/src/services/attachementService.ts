import { attachmentApi } from "../lib/api/attachments";

function createAttachmentService() {
  const uploadAttachment = async (
    file: File,
    onProgress?: (p: number) => void,
  ) => {
    const data = await attachmentApi.uploadAttachment(file, (p) => {
      if (onProgress) onProgress(p);
    });
    console.log({ data });
    return null;
  };
  return { uploadAttachment };
}
export const attachmentService = createAttachmentService();
