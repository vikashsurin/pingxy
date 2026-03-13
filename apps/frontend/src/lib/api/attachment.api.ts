export const createAttachmentApi = (customFetch: typeof fetch = fetch) => ({
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await customFetch(`/api/attachments/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload file");
    }
    const result = await response.json();
    return result.attachment;
  },

  uploadFileXHR: (file: File, onProgress: (percent: number) => void) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      // This is the magic event listener
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error")));

      xhr.open("POST", "/api/attachments/upload");
      xhr.send(formData);
    });
  },
});

export const attachmentApi = createAttachmentApi();
