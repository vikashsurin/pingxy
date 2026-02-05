import { publish } from "src/common/socket/pubsub";
import { ReceiptRepository } from "./receipt.repository";
import {
  ClientMessageReceiptType,
  ServerReceiptStatusType,
} from "@pingxy/shared/types";

export const ReceiptService = {
  createMessageReceipt: async ({
    conversationId,
    messageId,
    userId,
    status,
  }: {
    conversationId: number;
    messageId: number;
    userId: number;
    status: "sent" | "delivered" | "read";
  }) => {
    const messageReceipt = await ReceiptRepository.insertMessageReceipt({
      conversationId,
      messageId,
      userId,
      status,
    });
    return messageReceipt;
  },

  processMarkAllRead: async (data: ClientMessageReceiptType) => {
    const conversationId = data.payload.conversationId;
    const userId = data.payload.userId;
    const ackUserId = data.payload.recipient.id;

    if (conversationId && userId) {
      const messageReceipts =
        await ReceiptRepository.updateAllMessageReceiptsToRead({
          conversationId,
          userId,
        });
      const read: ServerReceiptStatusType = {
        type: "receipt.update.status",
        id: data.id,
        payload: {
          receipts: messageReceipts,
        },
      };
      publish(`inbox:${ackUserId}`, JSON.stringify(read));

      return messageReceipts;
    }
    return null;
  },

  processDeliveryReceipt: async (data: ClientMessageReceiptType) => {
    const messageId = data.payload.messageId;
    if (!messageId) return null;

    const userId = data.payload.userId;
    const ackUserId = data.payload.recipient.id;

    console.log("marking as delivered::", messageId, userId);

    const messageReceipts =
      await ReceiptRepository.updateMessageReceiptToDelivered({
        messageId,
        userId,
      });

    const delivered: ServerReceiptStatusType = {
      type: "receipt.update.status",
      id: data.id,
      payload: {
        receipts: messageReceipts,
      },
    };
    publish(`inbox:${ackUserId}`, JSON.stringify(delivered));

    return messageReceipts;
  },

  processReadReceipt: async (data: ClientMessageReceiptType) => {
    const messageId = data.payload.messageId;
    if (!messageId) return null;
    const userId = data.payload.userId;
    const ackUserId = data.payload.recipient.id;

    const messageReceipts = await ReceiptRepository.updateMessageReceiptToRead({
      messageId,
      userId,
    });

    const read: ServerReceiptStatusType = {
      type: "receipt.update.status",
      id: data.id,
      payload: {
        receipts: messageReceipts,
      },
    };
    publish(`inbox:${ackUserId}`, JSON.stringify(read));

    return messageReceipts;
  },

  // markAsSent : async ({
  //   messageId,
  //   userId
  // }: {
  //   messageId: number,
  //   userId: number
  // }) => {
  //   const messageReceipt = await ReceiptRepository.updateMessageReceiptToSent({
  //     messageId,
  //     userId
  //   });
  //   return messageReceipt;
  // }
};
