import { factory } from "@core/db/drizzle-factory";
import { authMiddleware } from "@core/middlewares/auth";
import { getConversationsByUser } from "./conv.service";
import { getMessagesAndReceiptsByConversation, getMessagesByConversation } from "../messages";

const app = factory.createApp();

app.use(authMiddleware);


// GET all the conversations from a user
app.get("/", async (c) => {
  const user = c.get("user");
  const conversations = await getConversationsByUser({ user_id: user.id });


  return c.json({ conversations: conversations })
})

// GET all the messages and receipts from a conversation
app.get("/:conversation_id/messages/:user_id", async (c) => {
  const conversation_id = Number(c.req.param("conversation_id"));
  const user_id = Number(c.req.param("user_id"));
  const before = Number(c.req.query('before'));
  const after = Number(c.req.query('after'));
  const limit = Number(c.req.query('limit')) || 20;

  const result = await getMessagesAndReceiptsByConversation({
    conversation_id,
    user_id,
    before,
    after,
    limit
  });

  return c.json({
    result: result,
    hasMore: result.length === limit
  })
})


export const conversationRouter = app;
