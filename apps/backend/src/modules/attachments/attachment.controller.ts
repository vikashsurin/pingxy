import { factory } from "@lib/db/drizzle-factory";
import { AttachmentService } from "./attachment.service";

export const AttachmentController = {
  upload: factory.createHandlers(async (c) => {
    const body = await c.req.parseBody();
    const file = body.file as File;
    const user = c.get("user");

    if (!file) return c.json({ error: "No file provided" }, 400);

    const { key, thumbKey, } = await AttachmentService.uploadToStorage({
      file,
      userId: user.id,
    });


    return c.json(
      {
        attachment: {
          key,
          thumbKey,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        },
      },
      201,
    );
  }),
};
