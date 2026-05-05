import { factory } from "@lib/db/drizzle-factory";
import { validate } from "@lib/utils/validator";
import z from "zod";
import { ConversationInviteService } from "./conversation-invite.service";

export const ConversationIniviteController = {
  createInvite: factory.createHandlers(async () => { }),

  acceptInvite: factory.createHandlers(async () => { }),

  rejectInvite: factory.createHandlers(async () => { }),

  updateInvite: factory.createHandlers(async () => { }),

  invalidateInviteCode: factory.createHandlers(
    validate('param', z.object({ id: z.coerce.number() })),
    async (c) => {
      const { id } = c.req.valid('param');
      const result = await ConversationInviteService.invalidate(id);
      if (!result) {
        return c.notFound();
      }
      return c.json({ message: 'Invite code invalidated' });
    }),

  getInviteById: factory.createHandlers(
    validate('param', z.object({ id: z.coerce.number() })),
    async (c) => {

      const { id } = c.req.valid('param');
      console.log()

      const invite = await ConversationInviteService.getInviteById(id);
      if (!invite) {
        return c.notFound();
      }
      return c.json(invite)

    }),

  joinViaInvite: factory.createHandlers(
    validate('param', z.object({ invitecode: z.string() })),
    async (c) => {
      const { invitecode } = c.req.valid('param');
      const user = c.get("user")
      const result = await ConversationInviteService.joinViaInvite({ invitecode, userId: user.id });

      return c.json(result)
    }),

  deleteInvitesByIds: factory.createHandlers(
    validate('json', z.object({ ids: z.array(z.number()) })),
    async (c) => {
      const { ids } = c.req.valid('json');

      const result = await ConversationInviteService.deleteInvitesByIds(ids);
      return c.json(result)
    }),
};
