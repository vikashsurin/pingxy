import { factory } from "../db/factory";
import * as services from "../db/services";
const app = factory.createApp();


app.get("/", async (c) => {
  const user = c.get("user");
  const conversations = await services.getConversationsByUser(user.id);

  return c.json({ conversations }, 200);
});



// Fetch all Messages of a conversation
app.get("/messages/:conversation_id/:user_id", async (c) => {
  // const { conversation_id, user_id } = c.req.param()
  const conversation_id = Number(c.req.param("conversation_id"))
  const user_id = Number(c.req.param("user_id"))
  const result = await services.getConversationMessages({
    conversation_id, user_id
  })

  return c.json({ messages: result }, 200)
})

export default app;
