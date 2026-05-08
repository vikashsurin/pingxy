import axios from "axios";

function createAttachmentApi() {
  const baseUrl = "http://localhost/api/attachments";

  const uploadAttachment = async (
    file: File,
    signal: AbortSignal,
    onProgress: (percent: number) => void,
  ) => {
    const url = `${baseUrl}/upload`;
    const formData = new FormData();
    formData.append("file", file);

    console.log({ uploading: file });

    const { data } = await axios.post(url, formData, {
      signal,
      withCredentials: true,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        );

        onProgress(percentCompleted);
      },
    });

    if (!data) {
      throw new Error("Upload failed");
    }
    return data;
  };
  return {
    uploadAttachment,
  };
}

export const attachmentApi = createAttachmentApi();
