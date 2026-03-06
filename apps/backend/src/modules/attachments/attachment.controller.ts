import { factory } from "@common/db/drizzle-factory";
import { AttachmentService } from "./attachment.service";

export const AttachmentController = {
  upload: factory.createHandlers(async (c) => {
    const body = await c.req.parseBody();
    const file = body.file as File;
    const user = c.get("user");

    if (!file) return c.json({ error: "No file provided" }, 400);

    const { url, key } = await AttachmentService.fileUpload({
      file,
      userId: user.id,
    });

    console.log({ file, key, url });

    return c.json(
      {
        attachment: {
          id: key,
          url: url,
          name: file.name,
          mimeType: file.type,
          size: file.size,
        },
      },
      201,
    );
  }),
};
