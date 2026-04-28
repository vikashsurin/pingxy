import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
export function ImageModal({
  fileName,
  thumbUrl,
  url,
  alt,
}: {
  fileName: string;
  thumbUrl: string;
  url: string;
  alt: string;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <Image
          src={thumbUrl}
          alt={alt}
          width={100}
          height={100}
          className="rounded-sm"
        />
      </DialogTrigger>
      <DialogContent>
        <Image
          src={url}
          alt={alt}
          width={2000}
          height={2000}
          className="rounded-sm"
        />
        <DialogDescription className={"flex items-center justify-center"}>
          {fileName}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
