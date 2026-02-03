import { publish } from "src/common/socket/pubsub";
import { ReceiptRepository } from "./receipt.repository";
import {
  ClientMessageReceiptType,
  MessagePayload,
  ServerReceiptStatusType,
} from "@pingxy/shared/types";

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

  markAllAsRead: async (messagePayload: ClientMessageReceiptType) => {
    const conversation_id = messagePayload.payload.conversation_id;
    const user_id = messagePayload.payload.user_id;
    const ack_user_id = messagePayload.payload.recipient.id;

    if (conversation_id && user_id) {
      const messageReceipts =
        await ReceiptRepository.updateAllMessageReceiptsToRead({
          conversation_id,
          user_id,
        });
      const read: ServerReceiptStatusType = {
        type: "receipt.update.status",
        id: messagePayload.id,
        payload: {
          receipts: messageReceipts,
        },
      };
      publish(`inbox:${ack_user_id}`, JSON.stringify(read));

      return messageReceipts;
    }
    return null;
  },

  markAsDelivered: async (messagePayload: ClientMessageReceiptType) => {
    const message_id = messagePayload.payload.message_id;
    const user_id = messagePayload.payload.user_id;
    const ack_user_id = messagePayload.payload.recipient.id;

    console.log("marking as delivered::", message_id, user_id);

    const messageReceipt =
      await ReceiptRepository.updateMessageReceiptToDelivered({
        message_id,
        user_id,
      });

    const delivered: ServerReceiptStatusType = {
      type: "receipt.update.status",
      id: messagePayload.id,
      payload: {
        receipts: [messageReceipt],
      },
    };
    publish(`inbox:${ack_user_id}`, JSON.stringify(delivered));

    return messageReceipt;
  },

  markAsRead: async (messagePayload: ClientMessageReceiptType) => {
    const message_id = messagePayload.payload.message_id;
    const user_id = messagePayload.payload.user_id;
    const ack_user_id = messagePayload.payload.recipient.id;

    const messageReceipt = await ReceiptRepository.updateMessageReceiptToRead({
      message_id,
      user_id,
    });

    const read: ServerReceiptStatusType = {
      type: "receipt.update.status",
      id: messagePayload.id,
      payload: {
        receipts: [messageReceipt],
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
