import { factory } from "@common/db/drizzle-factory";
import { validate } from "@common/utils/validator";
import { Context } from "hono";
import { z } from "zod";
import { MessageService } from "../messages/message.service";
import { ConversationService } from "./conversation.service";

export const ConversationController = {
  getAll: async (c: Context) => {
    const user = c.get("user");
    const conversations = await ConversationService.getByUser({ user_id: user.id });
    return c.json({ conversations: conversations });
  },

  getAllMessagesAndReceipts: async (c: Context) => {
    const conversation_id = Number(c.req.param("conversation_id"));
    const user_id = Number(c.req.param("user_id"));
    const before = Number(c.req.query("before"));
    const after = Number(c.req.query("after"));
    const limit = Number(c.req.query("limit")) || 20;

    console.log({ conversation_id, user_id, before, after, limit });

    const result = await MessageService.getMessagesAndReceiptsByConversation({
      conversation_id,
      user_id,
      before,
      after,
      limit,
    });

    return c.json({
      chat: result,
      hasMore: result.length === limit,
    });
  },

  getConversationByUserIds: factory.createHandlers(
    validate("param", z.object({ currentUserId: z.coerce.number(), userId: z.coerce.number() })),
    async (c) => {

      const { currentUserId, userId } = c.req.valid('param');

      const conversation = await ConversationService.findByUsers({ currentUserId, userId });

      return c.json({ ...conversation });
    })
}
