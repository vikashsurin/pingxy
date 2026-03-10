import { authMiddleware } from "@common/middlewares/auth";
import { factory } from "src/common/db/drizzle-factory";
import { AttachmentController } from "./attachment.controller";

export const attachmentRouter = factory.createApp();

attachmentRouter.use(authMiddleware);

attachmentRouter.post(
  "/upload",
  ...AttachmentController.upload,
);
