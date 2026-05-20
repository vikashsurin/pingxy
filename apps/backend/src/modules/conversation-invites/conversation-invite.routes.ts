import { factory } from "@lib/db/drizzle-factory";
import { authMiddleware } from "@lib/middlewares/auth";
import { ConversationIniviteController } from "./conversation-invite.controller";


export const router = factory.createApp();
router.use(authMiddleware)

// create a new Invite
router.post(
  "/",
  ...ConversationIniviteController.createInvite,
);

// Get a single invite by id
router.get('/:id', ...ConversationIniviteController.getInviteById);
// Preview Invite
// GET api/invites/{invitecode}

// Join Invite
// POST api/invites/{invitecode}/join
router.post('/:invitecode/join', ...ConversationIniviteController.joinViaInvite);

// Delete invites by ids
// DELETE api/invites
router.delete('/', ...ConversationIniviteController.deleteInvitesByIds);

// Invalidate invite
// POST api/invites/{id}/invalidate
router.post('/:id/revoke', ...ConversationIniviteController.invalidateInviteCode);

// Update invite
// PUT api/invites/{id}
router.put('/:id', ...ConversationIniviteController.updateInvite);


export const conversationInviteRouter = router;
