import { MessagePayload } from "@chat/shared/types";
import { factory } from "@core/db/drizzle-factory";
import { authMiddleware } from "@core/middlewares/auth";
import { publish } from "@core/socket/pubsub";
import * as services from "./msg.service";

const app = factory.createApp();

app.use(authMiddleware);

//Create New Message
app.post("/", authMiddleware, async (c) => {
  const body = await c.req.json();

  const data: MessagePayload = body.messagePayload;

  const result = await services.createMessage({
    recipient_id: data.recipient?.id!,
    message: data.msgData?.message!,
  });



  // Broadcast message
  publish(
    `${result.conversation_id}`,
    JSON.stringify({
      type: "message",
      recipient: data.recipient!,
      msgData: result.msgData!,
    })
  );


  // Notify of new Message
  const notificationPayload: MessagePayload = {
    id: data.id!,
    type: "notification",
    recipient: data.recipient!,
    msgData: result.msgData!,
  };
  publish(
    `inbox:${result.recipient.user_id}`,
    JSON.stringify(notificationPayload)
  );

  return c.json({ result });
});
export const messageRouter = app;
