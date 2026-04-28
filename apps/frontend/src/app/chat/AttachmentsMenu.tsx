import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { attachmentReqSchema } from "@pingxy/shared";
import {
    IconFile,
    IconFileMusic,
    IconPhoto,
    IconPlus,
} from "@tabler/icons-react";
import { useRef } from "react";
import z from "zod";
import { type Upload } from "./types";

export function AttachmentsMenu({
  setFiles,
  setAttachments,
  setUploads,
}: {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setAttachments: React.Dispatch<
    React.SetStateAction<z.infer<typeof attachmentReqSchema>[]>
  >;
  setUploads: React.Dispatch<React.SetStateAction<Record<string, Upload>>>;
}) {
  //   const { mutateAsync: upload, progress, isPending } = useUploadAttachment();

  //   console.log({ progress });

  // 1. Setup refs for the hidden inputs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Handle the file selection logic
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploads((prev) => ({
        ...prev,
        [`${file.name}-${file.size}`]: {
          id: file.name,
          file,
          progress: 0,
          controller: new AbortController(),
        },
      }));

      event.target.value = "";
    }
  };

  return (
    <>
      {/* 3. Hidden Inputs */}
      <input
        title="audio"
        type="file"
        ref={audioInputRef}
        className="hidden"
        accept="audio/*"
        onChange={(e) => handleFileChange(e, "audio")}
      />
      <input
        title="image"
        type="file"
        ref={photoInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "photo")}
      />
      <input
        title="file"
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => handleFileChange(e, "general")}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon" className="rounded-full">
              <IconPlus size={16} />
            </Button>
          }
        ></DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="top"
          className="rounded-lg w-40"
        >
          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-sm"
            onClick={() => audioInputRef.current?.click()}
          >
            <IconFileMusic size={18} />
            <span>Audio</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-sm"
            onClick={() => photoInputRef.current?.click()}
          >
            <IconPhoto size={18} />
            <span>Photo</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconFile size={18} />
            <span>File</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
