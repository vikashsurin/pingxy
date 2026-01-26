import { factory } from "src/common/db/drizzle-factory";
import { authMiddleware } from "src/common/middlewares/auth";
import { ConversationController } from "./conversation.controller";

export const conversationRouter = factory.createApp();

conversationRouter.use(authMiddleware);

// GET all the conversations from a user
conversationRouter.get("/", ConversationController.getAll);

// GET all the messages and receipts from a conversation
conversationRouter.get("/:conversation_id/messages/:user_id", ConversationController.getAllMessagesAndReceipts);
