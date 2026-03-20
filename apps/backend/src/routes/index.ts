import { attachmentRouter } from "@modules/attachments/attachment.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { blockedRouter } from "../modules/block/block.routes";
import { conversationRouter } from "../modules/conversations/conversation.routes";
import { messageRouter } from "../modules/messages/message.routes";
import { userRouter } from "../modules/users/user.routes";
import { receiptRouter } from "@modules/receipts/receipt.routes";
export function registerRoutes(app: any) {
  app.route("/api/auth", authRouter);
  app.route("/api/users", userRouter);
  app.route("/api/conversations", conversationRouter);
  app.route("/api/messages", messageRouter);
  app.route("/api/receipts", receiptRouter);
  app.route("/api/blocks", blockedRouter);
  app.route("/api/attachments", attachmentRouter);
}

export type AppRouter = typeof registerRoutes;
