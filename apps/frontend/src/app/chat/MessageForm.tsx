"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Sending from "@/src/components/Sending";
import { useSendMessage } from "@/src/queries/conversations";
import { attachmentReqSchema } from "@pingxy/shared/domain/attachment/index";
import { IconFileDescription, IconSend2, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import z from "zod";
import { AttachmentsMenu } from "./AttachmentsMenu";

export default function MessageForm({
  conversationId,
  recipientId,
  recipientName,
}: {
  conversationId?: number;
  recipientId?: number;
  recipientName?: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<
    z.infer<typeof attachmentReqSchema>[]
  >([]);

  console.log("files", files);

  const [content, setContent] = useState("");

  const { mutate, isPending } = useSendMessage();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if ((!content.trim() && files.length === 0) || isPending) return;

    mutate(
      {
        conversationId,
        content,
        recipientId,
        recipientName,
        attachments,
      },
      {
        onSuccess: () => {
          setContent("");
          setFiles([]);
          setAttachments([]);
        },
      },
    );
  }

  useEffect(() => {
    console.log("diles:", files);
  }, [files]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2  relative items-center  "
    >
      <SelectedPreview files={files} onRemove={removeFile} />
      <AttachmentsMenu setFiles={setFiles} setAttachments={setAttachments} />

      <label className="w-full">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message ${recipientName}...`}
          className="w-full border rounded-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          disabled={isPending}
        />
      </label>
      <Button
        type="submit"
        disabled={isPending || (!content.trim() && files.length === 0)}
        className="rounded-sm"
      >
        {isPending ? (
          <Sending />
        ) : (
          <span className="flex items-center gap-2">
            <IconSend2 size={16} /> Send
          </span>
        )}
      </Button>
    </form>
  );
}

// export function AttachmentsMenu({
//   setFiles,
//   setAttachments,
// }: {
//   setFiles: React.Dispatch<React.SetStateAction<File[]>>;
//   setAttachments: React.Dispatch<
//     React.SetStateAction<z.infer<typeof attachmentReqSchema>[]>
//   >;
// }) {
//   const { mutateAsync: upload, progress, isPending } = useUploadAttachment();

//   console.log({ progress });

//   // 1. Setup refs for the hidden inputs
//   const audioInputRef = useRef<HTMLInputElement>(null);
//   const photoInputRef = useRef<HTMLInputElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // 2. Handle the file selection logic
//   const handleFileChange = async (
//     event: React.ChangeEvent<HTMLInputElement>,
//     type: string,
//   ) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setFiles((prevFiles: File[]) => [...prevFiles, file]);
//       const attachment = await upload(file);

//       // setAttachments((prevAttachments) => [...prevAttachments, attachment]);

//       // const attachment = await attachmentService.uploadAttachment(file);
//       // setAttachments((prevAttachments) => [...prevAttachments, attachment]);

//       event.target.value = "";
//     }
//   };

//   return (
//     <>
//       {/* 3. Hidden Inputs */}
//       <input
//         title="audio"
//         type="file"
//         ref={audioInputRef}
//         className="hidden"
//         accept="audio/*"
//         onChange={(e) => handleFileChange(e, "audio")}
//       />
//       <input
//         title="image"
//         type="file"
//         ref={photoInputRef}
//         className="hidden"
//         accept="image/*"
//         onChange={(e) => handleFileChange(e, "photo")}
//       />
//       <input
//         title="file"
//         type="file"
//         ref={fileInputRef}
//         className="hidden"
//         onChange={(e) => handleFileChange(e, "general")}
//       />

//       <DropdownMenu>
//         <DropdownMenuTrigger
//           render={
//             <Button variant="outline" size="icon" className="rounded-full">
//               <IconPlus size={16} />
//             </Button>
//           }
//         ></DropdownMenuTrigger>

//         <DropdownMenuContent
//           align="start"
//           side="top"
//           className="rounded-lg w-40"
//         >
//           <DropdownMenuItem
//             className="cursor-pointer gap-2 rounded-sm"
//             onClick={() => audioInputRef.current?.click()}
//           >
//             <IconFileMusic size={18} />
//             <span>Audio</span>
//           </DropdownMenuItem>

//           <DropdownMenuItem
//             className="cursor-pointer gap-2 rounded-sm"
//             onClick={() => photoInputRef.current?.click()}
//           >
//             <IconPhoto size={18} />
//             <span>Photo</span>
//           </DropdownMenuItem>

//           <DropdownMenuItem
//             className="cursor-pointer gap-2 rounded-sm"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <IconFile size={18} />
//             <span>File</span>
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </>
//   );
// }

interface PreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function SelectedPreview({ files, onRemove }: PreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-3 w-full flex gap-2 flex-wrap p-3 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-0.5 mb-1">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          {files.length} file{files.length !== 1 ? "s" : ""} selected
        </span>
      </div>

      {files.map((file, index) => (
        <FileCard
          key={`${file.name}-${file.size}-${index}`}
          file={file}
          onRemove={() => onRemove(index)}
          progress={0}
        />
      ))}
    </div>
  );
}
function FileCard({
  file,
  onRemove,
  progress,
}: {
  file: File;
  onRemove: () => void;
  progress: number;
}) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  // Stable ref — no re-render when URL is created
  const previewRef = useRef<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isImage && !isVideo) return;

    const url = URL.createObjectURL(file);
    previewRef.current = url;

    // Set src directly on the DOM element — zero React re-renders
    if (isImage && imgRef.current) imgRef.current.src = url;
    if (isVideo && videoRef.current) videoRef.current.src = url;

    return () => URL.revokeObjectURL(url);
  }, [file, isImage, isVideo]);

  return (
    <div className="relative group flex flex-col items-center bg-white  rounded-sm p-2 w-28 hover:shadow-sm transition-shadow duration-200">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-500 z-10"
      >
        <IconX size={11} />
      </button>

      <div className="relative w-16 h-16 rounded-sm overflow-hidden bg-gray-100 flex items-center justify-center mb-2 shrink-0">
        {isImage && (
          // Plain img — no Next.js optimizer overhead for blob URLs
          <img
            ref={imgRef}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        )}
        {isVideo && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        )}
        {!isImage && !isVideo && (
          <IconFileDescription size={28} className="text-gray-400" />
        )}

        <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] font-bold px-1 py-0.5 rounded-tl-md leading-none">
          {getTypeBadge(file.type)}
        </span>
      </div>

      <div className="w-full text-center space-y-0.5 px-1">
        <Progress value={progress} className="h-1 mb-1 " />
        <p
          className="text-[10px] font-medium truncate text-gray-700 leading-tight"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="text-[9px] text-gray-400 font-mono">
          {formatSize(file.size)}
        </p>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getTypeBadge(type: string): string {
  if (type.startsWith("image/")) return type.split("/")[1].toUpperCase();
  if (type.startsWith("video/")) return type.split("/")[1].toUpperCase();
  if (type === "application/pdf") return "PDF";
  if (type.includes("word")) return "DOC";
  if (type.includes("sheet") || type.includes("excel")) return "XLS";
  if (type.includes("zip") || type.includes("compressed")) return "ZIP";
  return type.split("/")[1]?.toUpperCase().slice(0, 4) ?? "FILE";
}
