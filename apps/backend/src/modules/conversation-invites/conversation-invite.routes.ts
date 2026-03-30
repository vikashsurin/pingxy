import { factory } from "@lib/db/drizzle-factory";
import { ConversationIniviteController } from "./conversation-invite.controller";

export const conversationInviteRouter = factory.createApp();

conversationInviteRouter.post(
  "/",
  ...ConversationIniviteController.createInvite,
);
