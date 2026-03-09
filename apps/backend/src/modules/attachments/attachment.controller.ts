import { factory } from "@common/db/drizzle-factory";
import { AttachmentService } from "./attachment.service";

export const AttachmentController = {
  upload: factory.createHandlers(async (c) => {
    const body = await c.req.parseBody();
    const file = body.file as File;
    const user = c.get("user");

    if (!file) return c.json({ error: "No file provided" }, 400);

    const { attachmentId, key, url, thumbKey, thumbnailUrl } = await AttachmentService.fileUpload({
      file,
      userId: user.id,
    });


    return c.json(
      {
        attachment: {
          attachmentId,
          key,
          url,
          thumbKey,
          thumbnailUrl,
          name: file.name,
          mimeType: file.type,
          size: file.size,
        },
      },
      201,
    );
  }),
};
