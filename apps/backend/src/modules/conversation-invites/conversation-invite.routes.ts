import { factory } from "@lib/db/drizzle-factory";
import { authMiddleware } from "@lib/middlewares/auth";
import { ConversationIniviteController } from "./conversation-invite.controller";


export const conversationInviteRouter = factory.createApp();

conversationInviteRouter.use(authMiddleware)

// create a new Invite
conversationInviteRouter.post(
  "/",
  ...ConversationIniviteController.createInvite,
);

// Get a single invite by id
conversationInviteRouter.get('/:id', ...ConversationIniviteController.getInviteById);
// Preview Invite
// GET api/invites/{invitecode}

// Join Invite
// POST api/invites/{invitecode}/join
conversationInviteRouter.post('/:invitecode/join', ...ConversationIniviteController.joinViaInvite);

// Delete invites by ids
// DELETE api/invites
conversationInviteRouter.delete('/', ...ConversationIniviteController.deleteInvitesByIds);

// Invalidate invite
// POST api/invites/{id}/invalidate
conversationInviteRouter.post('/:id/revoke', ...ConversationIniviteController.invalidateInviteCode);

// Update invite
// PUT api/invites/{id}
conversationInviteRouter.put('/:id', ...ConversationIniviteController.updateInvite);
