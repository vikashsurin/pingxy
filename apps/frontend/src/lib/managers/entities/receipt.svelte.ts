import { messageStore } from "$lib/stores/messageStore.svelte";
import { validateSocket } from "$lib/utils/validateSocket";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type {
  Message,
  MessageReceipt,
  ReceiptRequestType,
} from "@pingxy/shared/types/index";
import { createClientReq } from "..";
import { chatStore } from "../../stores/store.svelte";

type ReceiptParams = {
  message: Message;
  userId: number;
};

const createReceiptManager = () => ({
  emitMarkSent: async () => {},

  emitMarkRead: async ({ message, userId }: ReceiptParams) => {
    const socket = validateSocket();
    if (!socket) return;

    const payload = createClientReq(DOMAIN_EVENTS.RECEIPTS.READ, {
      conversationId: message.conversationId,
      messageId: message.messageId,
      readerId: userId,
      sender: { id: message.senderId },
    });
    socket.send(JSON.stringify(payload));
  },

  emitMarkDelivered: async ({ message, userId }: ReceiptParams) => {
    const socket = validateSocket();
    if (!socket) return;

    const payload: ReceiptRequestType = {
      id: crypto.randomUUID(),
      type: DOMAIN_EVENTS.RECEIPTS.DELIVER,
      payload: {
        conversationId: message.conversationId,
        messageId: message.messageId,
        readerId: userId,
        sender: { id: message.senderId },
      },
    };
    socket.send(JSON.stringify(payload));
  },

  emitMarkAllRead: async ({
    conversationId,
    currentuserId,
    senderId,
  }: {
    conversationId: number;
    currentuserId: number;
    senderId: number;
  }) => {
    const socket = validateSocket();
    if (!socket || !chatStore.currentUser) return;

    const payload: ReceiptRequestType = {
      type: DOMAIN_EVENTS.RECEIPTS.ALL_READ,
      id: crypto.randomUUID(),
      payload: {
        conversationId,
        readerId: currentuserId,
        sender: { id: senderId },
      },
    };

    socket.send(JSON.stringify(payload));
  },

  handleIncomingReceipts: (receipts: MessageReceipt[]) => {
    for (const receipt of receipts) {
      messageStore.updateReceipt({
        msgId: receipt.messageId,
        newReceipt: receipt,
      });
    }
  },
});

export const receiptManager = createReceiptManager();
