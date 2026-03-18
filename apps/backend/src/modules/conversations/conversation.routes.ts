import { factory } from "src/common/db/drizzle-factory";
import { authMiddleware } from "src/common/middlewares/auth";
import { ConversationController } from "./conversation.controller";

export const conversationRouter = factory.createApp();

conversationRouter.use(authMiddleware);


conversationRouter.get(
  "/",
  ...ConversationController.initialFetch,
);

// Todo
conversationRouter.post(
  "/messages",
  ...ConversationController.createMessage,
);


// GET a conversation detail for a user
conversationRouter.get(
  "/:conversationId/partner",
  ...ConversationController.getPartner,
);


// GET all the messages and receipts from a conversation
conversationRouter.get(
  "/:conversationId/messages",
  ...ConversationController.getAllMessages,
);

// GET a conversation by user id's
conversationRouter.get(
  "/:currentUserId/:userId",
  ...ConversationController.getConversationByUserIds,
);

// GET a conversation by user id
// url /conversations/find?userId=
conversationRouter.get(
  "/find",
  ...ConversationController.findConversationByUserId,
);
