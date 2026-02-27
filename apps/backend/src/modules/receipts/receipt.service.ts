import { eventBus } from "@common/events";
import { createServerEvent } from "@common/socket/socket.factory";
import { ParticipantService } from "@modules/participants";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { ClientReqMap } from "@pingxy/shared/socket/types";
import { ReceiptRepository } from "./receipt.repository";
import { MessageService } from "@modules/messages";

export const ReceiptService = {
  createMessageReceipt: async ({
    conversationId,
    messageId,
    readerId,
    status,
  }: {
    conversationId: number;
    messageId: number;
    readerId: number;
    status: "sent" | "delivered" | "read";
  }) => {
    const messageReceipt = await ReceiptRepository.insertMessageReceipt({
      conversationId,
      messageId,
      readerId,
      status,
    });
    return messageReceipt;
  },

  processMarkAllRead: async (
    data: ClientReqMap[typeof DOMAIN_EVENTS.RECEIPTS.ALL_READ],
  ) => {
    const conversationId = data.payload.conversationId;
    const readerId = data.payload.readerId;
    const senderId = data.payload.sender.id;

    if (conversationId && readerId) {
      const messageReceipts =
        await ReceiptRepository.updateAllMessageReceiptsToRead({
          conversationId,
          readerId,
        });

      const latestMessage = await MessageService.findLatest(conversationId);

      await ParticipantService.resetUnreadCount({
        readerId,
        conversationId,
        messageId: latestMessage.messageId,
      });

      const event = createServerEvent(SERVER_EVENTS.RECEIPTS.ALL_READ, {
        receipts: messageReceipts,
        readerId: readerId,
        sender: {
          id: senderId,
        },
      });
      eventBus.emit(SERVER_EVENTS.RECEIPTS.ALL_READ, event);

      return messageReceipts;
    }
    return null;
  },

  processDeliveryReceipt: async (
    data: ClientReqMap[typeof DOMAIN_EVENTS.RECEIPTS.DELIVER],
  ) => {
    const messageId = data.payload.messageId;
    if (!messageId) return null;

    const readerId = data.payload.readerId;
    const senderId = data.payload.sender.id;

    const messageReceipts =
      await ReceiptRepository.updateMessageReceiptToDelivered({
        messageId,
        readerId,
      });

    const event = createServerEvent(SERVER_EVENTS.RECEIPTS.DELIVERED, {
      receipts: messageReceipts,
      readerId: readerId,
      sender: {
        id: senderId,
      },
    });

    eventBus.emit(SERVER_EVENTS.RECEIPTS.DELIVERED, event);
    return messageReceipts;
  },

  processReadReceipt: async (
    data: ClientReqMap[typeof DOMAIN_EVENTS.RECEIPTS.READ],
  ) => {
    const messageId = data.payload.messageId;
    const conversationId = data.payload.conversationId;
    if (!messageId) return null;
    const readerId = data.payload.readerId;
    const senderId = data.payload.sender.id;

    const messageReceipts = await ReceiptRepository.updateMessageReceiptToRead({
      messageId,
      readerId,
    });

    const event = createServerEvent(SERVER_EVENTS.RECEIPTS.READ, {
      receipts: messageReceipts,
      readerId: readerId,
      sender: {
        id: senderId,
      },
    });

    // Reset unread count for the sender
    await ParticipantService.resetUnreadCount({
      readerId,
      conversationId,
      messageId,
    });

    eventBus.emit(SERVER_EVENTS.RECEIPTS.READ, event);
    return messageReceipts;
  },

  getUnreadCount: async (readerId: number) => {
    return await ReceiptRepository.selectUnreadCountForUser(readerId);
  },
};
