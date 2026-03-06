import { factory } from "@common/db/drizzle-factory";
import { validate } from "@common/utils/validator";
import { Context } from "hono";
import { z } from "zod";
import { MessageService } from "../messages/message.service";
import { ConversationService } from "./conversation.service";

export const ConversationController = {
  getAll: factory.createHandlers(
    validate("query", z.object({ userId: z.coerce.number() })),
    async (c) => {
      const { userId } = c.req.valid("query");
      const result = await ConversationService.getAlByUser({
        userId,
      });
      return c.json(result);
    },
  ),

  getPartner: factory.createHandlers(
    validate("param", z.object({ conversationId: z.coerce.number() })),
    async (c) => {
      const user = c.get("user");

      const { conversationId } = c.req.valid("param");
      const result = await ConversationService.getPartnerForConversation({
        userId: user.id,
        conversationId,
      });

      return c.json(result);
    },
  ),

  getAllMessagesAndReceipts: async (c: Context) => {
    const conversationId = Number(c.req.param("conversationId"));
    const userId = Number(c.req.param("userId"));
    const before = Number(c.req.query("before"));
    const after = Number(c.req.query("after"));
    const limit = Number(c.req.query("limit")) || 20;

    const result = await MessageService.getMessagesAndReceiptsByConversation({
      conversationId,
      userId,
      before,
      after,
      limit,
    });

    return c.json({
      items: result,
      hasMore: result.length === limit,
    });
  },

  findConversationByUserId: factory.createHandlers(
    validate("query", z.object({ userId: z.coerce.number() })),
    async (c) => {
      const { id } = c.get("user");
      const { userId } = c.req.valid("query");
      const result = await ConversationService.findByUsers({
        currentUserId: id,
        userId: userId,
      });
      return c.json(result);
    },
  ),

  getConversationByUserIds: factory.createHandlers(
    validate(
      "param",
      z.object({ currentUserId: z.coerce.number(), userId: z.coerce.number() }),
    ),
    async (c) => {
      const { currentUserId, userId } = c.req.valid("param");

      const conversation = await ConversationService.findByUsers({
        currentUserId,
        userId,
      });

      if (!conversation) {
        return c.json({});
      }
      return c.json({ ...conversation });
    },
  ),
};
