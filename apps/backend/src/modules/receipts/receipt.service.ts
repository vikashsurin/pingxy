import { publish } from "src/common/socket/pubsub";
import { ReceiptRepository } from "./receipt.repository";
import {
  ClientMessageReceiptType,
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

  markAllAsRead: async (data: ClientMessageReceiptType) => {
    const conversation_id = data.payload.conversation_id;
    const user_id = data.payload.user_id;
    const ack_user_id = data.payload.recipient.id;

    if (conversation_id && user_id) {
      const messageReceipts =
        await ReceiptRepository.updateAllMessageReceiptsToRead({
          conversation_id,
          user_id,
        });
      const read: ServerReceiptStatusType = {
        type: "receipt.update.status",
        id: data.id,
        payload: {
          receipts: messageReceipts,
        },
      };
      publish(`inbox:${ack_user_id}`, JSON.stringify(read));

      return messageReceipts;
    }
    return null;
  },

  markAsDelivered: async (data: ClientMessageReceiptType) => {
    const message_id = data.payload.message_id;
    if (!message_id) return null;

    const user_id = data.payload.user_id;
    const ack_user_id = data.payload.recipient.id;

    console.log("marking as delivered::", message_id, user_id);

    const messageReceipts =
      await ReceiptRepository.updateMessageReceiptToDelivered({
        message_id,
        user_id,
      });

    const delivered: ServerReceiptStatusType = {
      type: "receipt.update.status",
      id: data.id,
      payload: {
        receipts: messageReceipts,
      },
    };
    publish(`inbox:${ack_user_id}`, JSON.stringify(delivered));

    return messageReceipts;
  },

  markAsRead: async (data: ClientMessageReceiptType) => {
    const message_id = data.payload.message_id;
    if (!message_id) return null;
    const user_id = data.payload.user_id;
    const ack_user_id = data.payload.recipient.id;

    const messageReceipts = await ReceiptRepository.updateMessageReceiptToRead({
      message_id,
      user_id,
    });

    const read: ServerReceiptStatusType = {
      type: "receipt.update.status",
      id: data.id,
      payload: {
        receipts: messageReceipts,
      },
    };
    publish(`inbox:${ack_user_id}`, JSON.stringify(read));

    return messageReceipts;
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
