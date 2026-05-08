"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Sending from "@/src/components/Sending";
import { useSendMessage } from "@/src/hooks/api/useConversations";
import { attachmentService } from "@/src/services/attachementService";
import { attachmentReqSchema } from "@pingxy/shared/domain/attachment/index";
import { IconFileDescription, IconSend2, IconX } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import z from "zod";
import { AttachmentsMenu } from "./AttachmentsMenu";
import { type Upload } from "./types";

export default function MessageForm({
  conversationId,
  recipientId,
  recipientName,
}: {
  conversationId?: number;
  recipientId?: number;
  recipientName?: string;
}) {
  const [uploads, setUploads] = useState<Record<string, Upload>>({});
  const [attachments, setAttachments] = useState<
    z.infer<typeof attachmentReqSchema>[]
  >([]);
  const startedUploads = useRef<Set<string>>(new Set());
  const controllersRef = useRef<Record<string, AbortController>>({});
  const [content, setContent] = useState("");

  const { mutate, isPending } = useSendMessage();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if ((!content.trim() && attachments.length === 0) || isPending) return;

    console.log({ content, attachments });
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
          clearForm();
        },
      },
    );
  }

  function clearForm() {
    setContent("");
    setUploads({});
    setAttachments([]);
  }
  // const [progress, setProgress] = useState(0);

  useEffect(() => {
    for (const [key, upload] of Object.entries(uploads)) {
      if (startedUploads.current.has(key)) continue;
      startedUploads.current.add(key);

      const controller = new AbortController();
      controllersRef.current[key] = controller;

      attachmentService
        .uploadAttachment(upload.file, controller.signal, (p) => {
          setUploads((prev) => ({
            ...prev,
            [key]: { ...prev[key], progress: p },
          }));
        })
        .then((data) => {
          setAttachments((prev) => [...prev, data.attachment]);
        })
        .catch((err) => {
          if (axios.isCancel(err)) return;
        });
    }
  }, [uploads]);

  const removeFile = (key: string) => {
    controllersRef.current[key]?.abort();
    delete controllersRef.current[key];
    startedUploads.current.delete(key);

    setUploads((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2  p-2  bg-white border-t relative items-center  "
    >
      <SelectedPreview uploads={uploads} onRemove={removeFile} />
      <AttachmentsMenu setUploads={setUploads} />

      <label className="w-full">
        <Input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message ${recipientName}`}
          className="bg-white border border-gray-300"
        />
      </label>
      <Button
        type="submit"
        disabled={isPending || (!content.trim() && attachments.length === 0)}
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

export function SelectedPreview({
  uploads,
  onRemove,
}: {
  uploads: Record<string, Upload>;
  onRemove: (key: string) => void;
}) {
  const files = Object.values(uploads);

  if (files.length === 0) return null;

  return (
    <div className=" absolute bottom-full left-0  w-full flex gap-2 flex-wrap p-3 bg-white/20 backdrop-blur-md border-y border-gray-200  max-h-64 overflow-y-auto z-50">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-0.5 py-2 ">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {files.length} file{files.length !== 1 ? "s" : ""} selected
        </span>
      </div>

      {Object.entries(uploads)
        .filter(([, upload]) => upload.file)
        .map(([key, upload]) => (
          <FileCard
            key={upload.id}
            file={upload.file}
            onRemove={() => onRemove(key)}
            progress={upload.progress}
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
    <div className="relative  group flex flex-col gap-2  items-center bg-white  rounded-md p-2 border w-28 hover:shadow-sm transition-shadow duration-200">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-500 z-10"
      >
        <IconX size={11} />
      </button>

      <div className="relative aspect-square rounded-xs  overflow-hidden bg-gray-100 flex items-center justify-center  shrink-0">

        {isImage && (
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

      {/*file details*/}
      <div data-file-details className="w-full flex flex-col gap-2 ">
        <RenderProgress progress={progress} />
        <p
          className="text-[10px] font-medium truncate text-gray-700 leading-tight"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="text-xs text-gray-400 font-mono">
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

function RenderProgress({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-0.5">
      <Progress value={progress} className={"w-full"}></Progress>
      <span className="text-xs">{progress}%</span>
    </div>
  );
}
