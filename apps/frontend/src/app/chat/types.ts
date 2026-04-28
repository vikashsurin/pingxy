export type Upload = {
  id: string;
  file: File;
  progress: number;
  controller: AbortController;
};
