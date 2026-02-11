import { authRouter } from "../modules/auth/auth.routes";
import { conversationRouter } from "../modules/conversations/conversation.routes";
import { messageRouter } from "../modules/messages/message.routes";
import { userRouter } from "../modules/users/user.routes";
import { blockedRouter } from "../modules/block/blocked.routes";

export function registerRoutes(app: any) {
  app.route("/api/auth", authRouter);
  app.route("/api/users", userRouter);
  app.route("/api/conversations", conversationRouter);
  app.route("/api/messages", messageRouter);
  app.route("/api/blocks", blockedRouter);
}

export type AppRouter = typeof registerRoutes;
