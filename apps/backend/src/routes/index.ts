import { authRouter } from "../features/auth/auth.routes";
import { conversationRouter } from "../features/conversations/conv.routes";
import { messageRouter } from "../features/messages/msg.routes";
import { userRouter } from "../features/users/user.routes";


export function registerRoutes(app: any) {
  app.route("/api/auth", authRouter);
  app.route("/api/users", userRouter);
  app.route("/api/conversations", conversationRouter);
  app.route("/api/messages", messageRouter);
}

export type AppRouter = typeof registerRoutes;
