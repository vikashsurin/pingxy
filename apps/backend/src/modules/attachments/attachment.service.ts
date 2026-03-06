import { uploadToStorage } from "@common/utils/s3";
import { AttachmentRepository } from "./attachment.repository";

export const AttachmentService = {
  fileUpload: async ({ file, userId }: { file: File; userId: number }) => {
    // 1. Check file size
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File too large");
    }

    // 2. Upload the file
    const { url, key } = await uploadToStorage(file);

    // 3. save to record to db
    const [record] = await AttachmentRepository.insert({
      key,
      url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: userId,
    });

    if (!record) {
      throw new Error("Failed to save attachment to db");
    }

    return { key, url };
  },
};

// import { sql } from "drizzle-orm";
// import { messages } from "./message.table";
// import { deleteFromStorage } from "./s3.util";

// export const StorageCleanupService = {
//   async purgeOrphanedFiles() {
//     // 1. Get all files uploaded to MinIO in the last 24h (from your attachments table)
//     // 2. Filter for those NOT mentioned in the messages table

//     // Example SQL for JSONB check:
//     const orphanedFiles = await db.execute(sql`
//       SELECT a.attachment_id
//       FROM attachments a
//       WHERE a.created_at < NOW() - INTERVAL '24 hours'
//       AND NOT EXISTS (
//         SELECT 1 FROM messages m
//         WHERE m.attachments @> jsonb_build_array(jsonb_build_object('id', a.attachment_id))
//       )
//     `);

//     for (const file of orphanedFiles) {
//       console.log(`Deleting orphaned file: ${file.attachment_id}`);
//       await deleteFromStorage(file.attachment_id as string);
//       // Also delete the reference from your 'attachments' tracking table
//       await db.delete(attachments).where(eq(attachments.attachmentId, file.attachment_id));
//     }
//   }
// };

// import cron from "node-cron";

// // Run every day at 3:00 AM
// cron.schedule("0 3 * * *", async () => {
//   console.log("Starting storage cleanup...");
//   await StorageCleanupService.purgeOrphanedFiles();
//   console.log("Cleanup complete.");
// });
