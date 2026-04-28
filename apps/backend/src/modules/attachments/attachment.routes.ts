import { authMiddleware } from "@lib/middlewares/auth";
import { factory } from "@lib/db/drizzle-factory";
import { AttachmentController } from "./attachment.controller";

export const attachmentRouter = factory.createApp();

attachmentRouter.use(authMiddleware);

attachmentRouter.post("/upload", ...AttachmentController.upload);
