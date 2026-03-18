import { send } from "$lib/socket/socket.svelte";
import { receiptStore } from "$lib/stores/receiptStore.svelte";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type {
  MessageReceipt,
  ReceiptRequestType,
} from "@pingxy/shared/types/index";
import { createClientReq } from "..";

type ReceiptParams = {
  receipt: MessageReceipt;
  senderId: number;
  userId: number;
};

const createReceiptManager = () => ({
  emitMarkSent: async () => {},

  emitMarkRead: async ({ receipt, senderId, userId }: ReceiptParams) => {
    const payload = createClientReq(DOMAIN_EVENTS.RECEIPTS.READ, {
      conversationId: receipt.conversationId,
      messageId: receipt.messageId,
      readerId: userId,
      sender: { id: senderId },
    });
    send(payload);
  },

  emitMarkDelivered: async ({ receipt, senderId, userId }: ReceiptParams) => {
    const payload: ReceiptRequestType = {
      id: crypto.randomUUID(),
      type: DOMAIN_EVENTS.RECEIPTS.DELIVER,
      payload: {
        conversationId: receipt.conversationId,
        messageId: receipt.messageId,
        readerId: userId,
        sender: { id: senderId },
      },
    };
    send(payload);
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
    const payload: ReceiptRequestType = {
      type: DOMAIN_EVENTS.RECEIPTS.ALL_READ,
      id: crypto.randomUUID(),
      payload: {
        conversationId,
        readerId: currentuserId,
        sender: { id: senderId },
      },
    };

    send(payload);
  },

  handleIncomingReceipts: (receipts: MessageReceipt[]) => {
    for (const receipt of receipts) {
      receiptStore.upsertReceipt(receipt);
    }
  },
});

export const receiptManager = createReceiptManager();
