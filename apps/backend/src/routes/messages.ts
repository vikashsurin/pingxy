import { MessagePayload } from "@chat/shared/src/lib/utils/validation";
import { factory } from "../db/factory";
import * as services from '../db/services';
import { publish } from "../pubsub";

const app = factory.createApp()



app.post("/", async (c) => {
  const body = await c.req.json()

  const data: MessagePayload = body.messagePayload

  const result = await services.createMessage({
    recipient_id: data.recipient?.id!,
    message: data.message!
  })


  // Broadcast message
  publish(`${result.conversation_id}`, JSON.stringify({
    type: "message",
    recipient: data.recipient!,
    message: result.message!,
  }))


  // Notify of new Message
  const notificationPayload: MessagePayload = {
    id: data.id!,
    type: "notification",
    recipient: data.recipient!,
    message: result.message!,
  }
  publish(`inbox:${result.recipient.user_id}`, JSON.stringify(notificationPayload))

  return c.json({ result })

})
export default app
