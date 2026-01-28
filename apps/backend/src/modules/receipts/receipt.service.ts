import { publish } from "src/common/socket/pubsub";
import { ReceiptRepository } from "./receipt.repository";
import { MessagePayload } from "@chat/shared/types";

export const ReceiptService = {
  createMessageReceipt: async ({
    conversation_id,
    message_id,
    user_id,
    status,
  }: {
    conversation_id: number;
    message_id: number;
    user_id: number;
    status: "sent" | "delivered" | "read";
  }) => {
    const messageReceipt = await ReceiptRepository.insertMessageReceipt({
      conversation_id,
      message_id,
      user_id,
      status,
    });
    return messageReceipt;
  },

  markAllAsRead: async (messagePayload: MessagePayload) => {
    const conversation_id = messagePayload.data?.conversation_id;
    const user_id = messagePayload.data?.user_id;
    const ack_user_id = messagePayload.recipient?.id!;

    if (conversation_id && user_id) {
      const messageReceipts =
        await ReceiptRepository.updateAllMessageReceiptsToRead({
          conversation_id,
          user_id,
        });
      const read: MessagePayload = {
        type: "receipt_update",
        id: messagePayload.id,
        msgData: {
          receipt: messageReceipts,
        },
      };
      publish(`inbox:${ack_user_id}`, JSON.stringify(read));

      return messageReceipts;
    }
    return null;
  },

  markAsDelivered: async (messagePayload: MessagePayload) => {
    const message_id = messagePayload.data?.message_id!;
    const user_id = messagePayload.data?.user_id!;
    const ack_user_id = messagePayload.recipient?.id!;

    console.log("marking as delivered::", message_id, user_id);

    const messageReceipt =
      await ReceiptRepository.updateMessageReceiptToDelivered({
        message_id,
        user_id,
      });

    const delivered: MessagePayload = {
      type: "receipt_update",
      id: messagePayload.id,
      msgData: {
        receipt: messageReceipt,
      },
    };
    publish(`inbox:${ack_user_id}`, JSON.stringify(delivered));

    return messageReceipt;
  },

  markAsRead: async (messagePayload: MessagePayload) => {
    const message_id = messagePayload.data?.message_id!;
    const user_id = messagePayload.data?.user_id!;
    const ack_user_id = messagePayload.recipient?.id!;

    const messageReceipt = await ReceiptRepository.updateMessageReceiptToRead({
      message_id,
      user_id,
    });

    const read: MessagePayload = {
      type: "receipt_update",
      id: messagePayload.id,
      msgData: {
        receipt: messageReceipt,
      },
    };
    publish(`inbox:${ack_user_id}`, JSON.stringify(read));

    return messageReceipt;
  },

  // markAsSent : async ({
  //   message_id,
  //   user_id
  // }: {
  //   message_id: number,
  //   user_id: number
  // }) => {
  //   const messageReceipt = await ReceiptRepository.updateMessageReceiptToSent({
  //     message_id,
  //     user_id
  //   });
  //   return messageReceipt;
  // }
};
