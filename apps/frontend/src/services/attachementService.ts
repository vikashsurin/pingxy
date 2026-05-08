import { attachmentApi } from "../lib/api/attachmentsApi";

function createAttachmentService() {
  const uploadAttachment = async (
    file: File,
    signal: AbortSignal,
    onProgress?: (p: number) => void,
  ) => {
    const data = await attachmentApi.uploadAttachment(file, signal, (p) => {
      if (onProgress) onProgress(p);
    });
    console.log({ data });
    return data;
  };
  return { uploadAttachment };
}
export const attachmentService = createAttachmentService();
