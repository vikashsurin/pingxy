import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { attachmentService } from "../../services/attachementService";

export const useUploadAttachment = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: ({ file, signal }: { file: File; signal: AbortSignal }) =>
      attachmentService.uploadAttachment(file, signal, (p) => setProgress(p)),
    onSuccess: (data) => {
      setProgress(0);
    },
  });

  return { ...mutation, progress };
};
