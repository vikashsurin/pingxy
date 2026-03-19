import { factory } from "@lib/db/drizzle-factory";
import { authMiddleware } from "@lib/middlewares/auth";
import { MessageController } from "./message.controller";

export const messageRouter = factory.createApp();

messageRouter.use(authMiddleware);

// messageRouter.post("/", authMiddleware, ...MessageController.create);
