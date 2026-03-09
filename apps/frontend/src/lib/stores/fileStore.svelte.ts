import { formatFileSize } from "$lib/utils/file";

class FileEntry {
  id = crypto.randomUUID();
  file: File;
  previewUrl: string;
  size: string;
  type: string;

  // Reactive states
  progress = $state(0);
  status = $state("uploading");
  serverData = $state(null);

  // Non-reactive reference to the XHR object
  xhr: XMLHttpRequest | null = null;

  constructor(file: File) {
    this.file = file;
    this.previewUrl = URL.createObjectURL(file);
    this.size = formatFileSize({ bytes: file.size, precision: 2 });
    this.type = file.type
  }

  // Clean up resources
  destroy() {
    if (this.xhr) this.xhr.abort();
    URL.revokeObjectURL(this.previewUrl);
  }
}

export class FileStore {
  dummyData = [
    {
      id: 1,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 2,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 3,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 4,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 5,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 6,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 7,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 8,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 9,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 10,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 11,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
    {
      id: 12,
      previewUrl: "https://picsum.photos/536/354",
      size: "",
    },
  ];


  files = $state<FileEntry[]>([]);
  preview = $state('')

  addFile(newFile: File) {
    if (!newFile) return;
    const entry = new FileEntry(newFile);
    this.files.push(entry);
    this.performXhrUpload(entry);
  }

  // Necessary for drag-and-drop
  addFiles(newFiles: FileList | File[]) {
    Array.from(newFiles).forEach((file) => this.addFile(file));
  }

  removeFile(id: string) {
    const index = this.files.findIndex((f) => f.id === id);
    if (index !== -1) {
      this.files[index].destroy(); // Abort XHR and revoke URL
      this.files.splice(index, 1);
    }
  }

  // 1. Upload file to storage server, and returns the server data
  // 2. Store the server data on the entry
  private performXhrUpload(entry: FileEntry) {
    const xhr = new XMLHttpRequest();
    entry.xhr = xhr; // Attach to entry so we can abort it later

    const formData = new FormData();
    formData.append("file", entry.file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        entry.progress = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        console.log("{{data}} :: ", data)
        entry.serverData = data.attachment;
        entry.status = "done";
      } else {
        entry.status = "error";
      }
    };

    xhr.onabort = () => {
      entry.status = "aborted";
    };

    xhr.onerror = () => {
      entry.status = "error";
    };

    xhr.open("POST", "/api/attachments/upload");
    xhr.send(formData);
  }

  reset() {
    // 1. Loop through every file and call its internal destroy
    // This stops active uploads and clears memory for previews
    for (const file of this.files) {
      file.destroy();
    }

    // 2. Clear the reactive array
    this.files = [];
  }
}

export const fileStore = new FileStore();
