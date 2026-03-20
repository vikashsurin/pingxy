import { factory } from "@lib/db/drizzle-factory";
import { validate } from "@lib/utils/validator";
import { messageCreateSchema } from "@pingxy/shared/domain";
import { z } from "zod";
import { MessageService } from "../messages/message.service";
import { ConversationService } from "./conversation.service";

export const ConversationController = {

  initialFetch: factory.createHandlers(
    async (c) => {
      const user = c.get("user");
      const userId = user.id;
      const data = await ConversationService.convAggregation({ userId })
      if (!data) return c.notFound();
      return c.json(data);
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


  getAllMessages: factory.createHandlers(
    validate("param", z.object({ conversationId: z.coerce.number() })),
    validate(
      "query",
      z.object({
        limit: z.coerce.number().optional().default(10),
        before: z.coerce.number().optional().nullable(),
        after: z.coerce.number().optional().nullable(),
      }),
    ),

    async (c) => {
      const user = c.get("user");
      const userId = user.id;
      const { limit, before, after } = c.req.valid("query");
      const { conversationId } = c.req.valid("param");


      const result = await MessageService.getMessages({
        conversationId,
        userId,
        limit,
        before,
        after,
      });

      return c.json({
        entities: {
          messages: result.entities.messages,
          receipts: result.entities.receipts,
          attachments: result.entities.attachments,
        },
        hasMore: result.entities.messages.length === limit,
      });
    },
  ),

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

  createMessage: factory.createHandlers(
    validate("json", messageCreateSchema),
    async (c) => {
      const body = c.req.valid("json");
      const user = c.get("user");

      const message = await ConversationService.sendMessage(body, user);

      return c.json({ data: message }, 201);
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
