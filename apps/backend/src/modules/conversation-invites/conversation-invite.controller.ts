import { factory } from "@lib/db/drizzle-factory";

export const ConversationIniviteController = {
  createInvite: factory.createHandlers(async () => {}),

  acceptInvite: factory.createHandlers(async () => {}),

  rejectInvite: factory.createHandlers(async () => {}),

  invalidate: factory.createHandlers(async () => {}),
};
