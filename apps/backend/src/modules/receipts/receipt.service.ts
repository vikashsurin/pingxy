import { SERVER_EVENTS } from "@pingxy/shared/socket/events";
import type { SocketEventMap } from "@pingxy/shared/socket/types";
import { publish } from "src/common/socket/pubsub";
import { ReceiptRepository } from "./receipt.repository";

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

  processMarkAllRead: async (data: SocketEventMap["req:receipts.all.read"]) => {
    const conversationId = data.payload.conversationId;
    const userId = data.payload.userId;
    const ackUserId = data.payload.recipient.id;

    if (conversationId && userId) {
      const messageReceipts =
        await ReceiptRepository.updateAllMessageReceiptsToRead({
          conversationId,
          userId,
        });
      const read: SocketEventMap["event:receipts.all.read"] = {
        type: SERVER_EVENTS.RECEIPTS.ALL_READ,
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

  processDeliveryReceipt: async (data: SocketEventMap["req:receipt.deliver"]) => {
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

    const delivered: SocketEventMap["event:receipt.delivered"] = {
      type: SERVER_EVENTS.RECEIPTS.DELIVERED,
      id: data.id,
      payload: {
        receipts: messageReceipts,
      },
    };
    publish(`inbox:${ackUserId}`, JSON.stringify(delivered));

    return messageReceipts;
  },

  processReadReceipt: async (data: SocketEventMap["req:receipt.read"]) => {
    const messageId = data.payload.messageId;
    if (!messageId) return null;
    const userId = data.payload.userId;
    const ackUserId = data.payload.recipient.id;

    const messageReceipts = await ReceiptRepository.updateMessageReceiptToRead({
      messageId,
      userId,
    });

    const read: SocketEventMap['event:receipt.read'] = {
      type: SERVER_EVENTS.RECEIPTS.READ,
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
