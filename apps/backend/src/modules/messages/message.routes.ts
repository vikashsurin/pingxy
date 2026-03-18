import { factory } from "src/common/db/drizzle-factory";
import { authMiddleware } from "src/common/middlewares/auth";
import { MessageController } from "./message.controller";

export const messageRouter = factory.createApp();

messageRouter.use(authMiddleware);

// messageRouter.post("/", authMiddleware, ...MessageController.create);
