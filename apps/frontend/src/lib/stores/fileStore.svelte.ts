// fileStore.svelte.ts
import { formatFileSize } from "$lib/utils/file";
import type { attachmentSelectSchema } from "@pingxy/shared/domain/attachment/attachment.schema";
import type z from "zod";

class FileEntry {
  id = crypto.randomUUID();
  file: File;
  previewUrl: string;
  size: string;

  progress = $state(0);
  status = $state<"uploading" | "done" | "error">("uploading");
  serverData = $state<z.infer<typeof attachmentSelectSchema> | null>(null);

  constructor(file: File) {
    this.file = file;
    this.previewUrl = URL.createObjectURL(file);
    this.size = formatFileSize({ bytes: file.size, precision: 2 });
  }

  async upload() {
    const formData = new FormData();
    formData.append("file", this.file);
    formData.append("userId", "1");

    try {
      const res = await fetch("/api/attachments/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      this.serverData = await res.json();
      this.status = "done";
    } catch {
      this.status = "error";
    }
  }

  // Progress requires XHR — keep separate if needed
  uploadWithProgress() {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      const formData = new FormData();
      formData.append("file", this.file);
      formData.append("userId", "1");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          this.progress = Math.round((e.loaded / e.total) * 100);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText).attachment;
            console.log({ ddaata: data });
            this.serverData = data;
            this.status = "done";
            resolve();
          } catch {
            this.status = "error";
            reject();
          }
        } else {
          this.status = "error";
          reject();
        }
      };

      xhr.onerror = () => {
        this.status = "error";
        reject();
      };

      xhr.open("POST", "/api/attachments/upload");
      xhr.send(formData);
    });
  }

  destroy() {
    URL.revokeObjectURL(this.previewUrl);
  }
}

class FileStore {
  files = $state<FileEntry[]>([]);

  add(newFiles: FileList | File[]) {
    for (const file of Array.from(newFiles)) {
      const entry = new FileEntry(file);
      this.files.push(entry); // ✅ push is fine with $state arrays
      entry.uploadWithProgress();
    }
  }

  remove(id: string) {
    const idx = this.files.findIndex((f) => f.id === id);
    if (idx === -1) return;
    this.files[idx].destroy();
    this.files.splice(idx, 1); // ✅ splice works reactively too
  }

  clear() {
    this.files.forEach((f) => f.destroy());
    this.files = [];
  }

  // Derived values as getters
  get allDone() {
    return this.files.every((f) => f.status === "done");
  }

  get hasError() {
    return this.files.some((f) => f.status === "error");
  }

  get uploadingCount() {
    return this.files.filter((f) => f.status === "uploading").length;
  }
}

export const fileStore = new FileStore();
