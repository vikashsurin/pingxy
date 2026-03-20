import { send } from "$lib/socket/socket.svelte";
import { receiptStore } from "$lib/stores/receiptStore.svelte";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type {
  MessageReceipt,
  ReceiptRequestType,
} from "@pingxy/shared/types/index";
import { createClientReq } from "..";
import { receiptApi } from "$lib/api/receipt.api";

type ReceiptParams = {
  receipt: MessageReceipt;
  senderId: number;
  // userId: number;
};

const createReceiptManager = () => ({
  emitMarkSent: async () => { },

  // emitMarkRead: async ({ receipt, senderId }: ReceiptParams) => {
  //   const payload = createClientReq(DOMAIN_EVENTS.RECEIPTS.READ, {
  //     conversationId: receipt.conversationId,
  //     messageId: receipt.messageId,
  //     // readerId: userId,
  //     sender: { id: senderId },
  //   });
  //   send(payload);
  // },

  // newEmitMarkRead: async ({ receipt, senderId }: ReceiptParams) => {
  //   const envelope = createClientReq(DOMAIN_EVENTS.RECEIPTS.UPDATE, {
  //     id: receipt.id,
  //     messageId: receipt.messageId,
  //     conversationId: receipt.conversationId,
  //     status: "read",
  //     sender: { id: senderId },
  //   });

  //   receiptApi.updateReceipt(envelope);
  // },

  updateReceipt: async ({ receipt, status, senderId }: ReceiptParams & { status: 'sent' | 'delivered' | 'read' }) => {
    const envelope = createClientReq(DOMAIN_EVENTS.RECEIPTS.UPDATE, {
      id: receipt.id,
      messageId: receipt.messageId,
      conversationId: receipt.conversationId,
      status: status,
      sender: { id: senderId },
    });

    receiptApi.updateReceipt(envelope);
  },

  updateAllReceiptsToRead: async ({ conversationId, senderId }: { conversationId: number; senderId: number }) => {
    const envelope = createClientReq(DOMAIN_EVENTS.RECEIPTS.UPDATE_ALL, {
      conversationId,
      status: "read",
      sender: { id: senderId },
    });

    receiptApi.upateReceiptsToRead(envelope);
  },

  // newEmitMarkDelivered: async ({ receipt, senderId }: ReceiptParams) => {
  //   const envelope = createClientReq(DOMAIN_EVENTS.RECEIPTS.UPDATE, {
  //     id: receipt.id,
  //     messageId: receipt.messageId,
  //     conversationId: receipt.conversationId,
  //     status: "delivered",
  //     sender: { id: senderId },
  //   });

  //   receiptApi.updateReceipt(envelope);
  // },


  // emitMarkDelivered: async ({ receipt, senderId }: ReceiptParams) => {
  //   const payload: ReceiptRequestType = {
  //     id: crypto.randomUUID(),
  //     type: DOMAIN_EVENTS.RECEIPTS.DELIVER,
  //     payload: {
  //       conversationId: receipt.conversationId,
  //       messageId: receipt.messageId,
  //       // readerId: userId,
  //       sender: { id: senderId },
  //     },
  //   };
  //   send(payload);
  // },

  // emitMarkAllRead: async ({
  //   conversationId,
  //   currentuserId,
  //   senderId,
  // }: {
  //   conversationId: number;
  //   currentuserId: number;
  //   senderId: number;
  // }) => {
  //   const payload: ReceiptRequestType = {
  //     type: DOMAIN_EVENTS.RECEIPTS.ALL_READ,
  //     id: crypto.randomUUID(),
  //     payload: {
  //       conversationId,
  //       // readerId: currentuserId,
  //       sender: { id: senderId },
  //     },
  //   };

  //   send(payload);
  // },

  handleIncomingReceipts: (receipts: MessageReceipt[]) => {
    for (const receipt of receipts) {
      receiptStore.upsertReceipt(receipt);
    }
  },
});

export const receiptManager = createReceiptManager();
