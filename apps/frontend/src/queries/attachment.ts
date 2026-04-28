import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { attachmentService } from "../services/attachementService";
import { Signal } from "lucide-react";

export const useUploadAttachment = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) =>
      attachmentService.uploadAttachment(file, {}, (p) => setProgress(p)),
    onSuccess: (data) => {
      setProgress(0);
    },
  });

  return { ...mutation, progress };
};
