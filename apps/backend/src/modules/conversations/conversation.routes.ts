import { factory } from "src/common/db/drizzle-factory";
import { authMiddleware } from "src/common/middlewares/auth";
import { ConversationController } from "./conversation.controller";

export const conversationRouter = factory.createApp();

conversationRouter.use(authMiddleware);

// GET all detailed conversations for a user
// GET /conversations?userId=123  : replace with this TODO
conversationRouter.get("/", ...ConversationController.getAll);

// GET a conversation detail for a user
conversationRouter.get('/:conversationId/partner', ...ConversationController.getPartner);

// GET all the messages and receipts from a conversation
conversationRouter.get(
  "/:conversationId/messages/:userId",
  ConversationController.getAllMessagesAndReceipts,
);

// GET a conversation by user id's
conversationRouter.get(
  "/:currentUserId/:userId",
  ...ConversationController.getConversationByUserIds,
);
