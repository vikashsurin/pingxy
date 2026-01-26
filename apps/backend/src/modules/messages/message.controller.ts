import { MessagePayload } from "@chat/shared/types";
import { publish } from "@common/socket/pubsub";
import { Context } from "hono";
import { MessageService } from "./message.service";

export const MessageController = {
  create: async (c: Context) => {
    const body = await c.req.json();

    const data: MessagePayload = body.messagePayload;

    const result = await MessageService.create({
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
      }),
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
      JSON.stringify(notificationPayload),
    );

    return c.json({ result });
  },
};
