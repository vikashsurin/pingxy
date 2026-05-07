import { factory } from "@lib/db/drizzle-factory";
import { authMiddleware } from "@lib/middlewares/auth";
import { ConversationController } from "./conversation.controller";

export const conversationRouter = factory.createApp();

conversationRouter.use(authMiddleware);

// Find a conversation with a given user id
conversationRouter.get("/find", ...ConversationController.findByUid);

// /api/conversations?type=direct|group
conversationRouter.get("/", ...ConversationController.getConversations);

// Delete a conversation
// /api/conversations/:conversationId
conversationRouter.delete(
  "/:conversationId",
  ...ConversationController.deleteConversation,
);

// Fetch a single conversation
conversationRouter.get(
  "/:conversationId",
  ...ConversationController.getConversation,
);

// Todo
conversationRouter.post("/messages", ...ConversationController.createMessage);

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
// conversationRouter.get(
//   "/find",
//   ...ConversationController.findConversationByUserId,
// );




// POST create a new group
conversationRouter.post("/groups", ...ConversationController.createGroup);

// Join a group
// POST /groups/:groupId/join
// conversationRouter.post("/groups/:groupId/join", ...ConversationController.joinGroup);

// Create new invite link
// POST /groups/:groupId/invites
conversationRouter.post(
  "/groups/:groupId/invites",
  ...ConversationController.createInvite,
);

// List all active invites
// GET /groups/:groupId/invites
conversationRouter.get(
  "/groups/:groupId/invites",
  ...ConversationController.getInvites,
);

// List all participants of a group conversation
// GET /groups/:groupId/participants
conversationRouter.get(
  "/groups/:groupId/participants",
  ...ConversationController.getGroupParticipants,
);

// # 1. Main list (Direct + Joined Groups)
// GET /api/conversations
// GET /api/conversations?type=direct
// GET /api/conversations?type=group     # only joined groups

// # 2. Discover / Browse groups
// GET /api/conversations/groups/discover
// GET /api/conversations/groups/discover?search=tech&category=programming

// # 3. Join actions (as we discussed earlier)
// POST /api/conversations/groups/{groupId}/join
// POST /api/conversations/groups/{groupId}/request   # for private groups
