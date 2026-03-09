import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import sharp from 'sharp';
import { s3Client } from "./index";

export const uploadToStorage = async (file: File) => {
  const uuid = Bun.randomUUIDv7();
  const fileExtension = file.name.split('.').pop();
  const fileKey = `uploads/${uuid}-${file.name}`;
  // Force thumbnail extension to webp for consistency
  const thumbKey = `thumbnails/${uuid}-thumb.webp`;

  // READ THE FILE ONCE to avoid stream consumption issues
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let thumbUrl = null;

  // 1. GENERATE THUMBNAIL
  if (file.type.startsWith("image/")) {
    const thumbBuffer = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    await uploadToS3(thumbKey, thumbBuffer, "image/webp");
    thumbUrl = `${process.env.STORAGE_PUBLIC_ENDPOINT}/pingxy/${thumbKey}`;
  }
  else if (file.type.startsWith("video/")) {
    // Basic FFmpeg thumbnail extraction via Bun.spawn
    // This requires ffmpeg to be installed on the system
    const tempVideoPath = `/tmp/${uuid}.${fileExtension}`;
    const tempThumbPath = `/tmp/${uuid}.jpg`;

    await Bun.write(tempVideoPath, buffer);

    const proc = Bun.spawn(["ffmpeg", "-i", tempVideoPath, "-ss", "00:00:01", "-vframes", "1", tempThumbPath]);
    await proc.exited;

    const thumbBuffer = await sharp(tempThumbPath)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    await uploadToS3(thumbKey, thumbBuffer, "image/webp");
    thumbUrl = `${process.env.STORAGE_PUBLIC_ENDPOINT}/pingxy/${thumbKey}`;

    // Cleanup temp files
    // import { unlink } from "node:fs/promises";
    // await Promise.all([unlink(tempVideoPath), unlink(tempThumbPath)]);
  }

  // 2. UPLOAD ORIGINAL
  // Use the buffer here instead of .stream() to ensure data integrity
  await uploadToS3(fileKey, buffer, file.type);

  return {
    attachmentId: uuid,
    key: fileKey,
    url: `${process.env.STORAGE_PUBLIC_ENDPOINT}/pingxy/${fileKey}`,
    thumbnailUrl: thumbUrl ? thumbUrl : null,
    thumbKey: thumbUrl ? thumbKey : null
  };
};

// Helper to dry up your code
const uploadToS3 = async (key: string, body: Buffer | Uint8Array, contentType: string) => {
  const uploader = new Upload({
    client: s3Client,
    params: {
      Bucket: "pingxy",
      Key: key,
      Body: body,
      ContentType: contentType,
    },
  });
  return uploader.done();
};

export const deleteFromStorage = async (key: string, thumbKey?: string | null) => {
  const commands = [
    s3Client.send(new DeleteObjectCommand({ Bucket: "pingxy", Key: key }))
  ];

  if (thumbKey) {
    commands.push(s3Client.send(new DeleteObjectCommand({ Bucket: "pingxy", Key: thumbKey })));
  }

  await Promise.all(commands);
};
