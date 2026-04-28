import axios from "axios";

function createAttachmentApi() {
  const baseUrl = "http://localhost/api/attachments";

  const uploadAttachment = async (
    file: File,
    onProgress: (percent: number) => void,
  ) => {
    const url = `${baseUrl}/upload`;
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(url, formData, {
      withCredentials: true,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        );
        onProgress(percentCompleted);
      },
    });
    console.log({ uploading: data });
    if (!data.success) {
      throw new Error(data.message);
    }
    return null;
  };
  return {
    uploadAttachment,
  };
}

export const attachmentApi = createAttachmentApi();
