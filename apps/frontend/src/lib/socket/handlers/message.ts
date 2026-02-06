import { type SocketHandlers } from "@pingxy/shared";
import * as messageManager from "$lib/store/managers/message.svelte";
import { chatStore } from "$lib/store/store.svelte";
import { virtualStore } from "$lib/store/virtualStore.svelte";

export const messageHandler: SocketHandlers = {
  "message.sent": (data) => {
    console.log("new message arrived");
    messageManager.handleIncomingMessage(data);
  },

  //   "users.online": (data) => {
  //     const { users } = data.payload;
  //     chatStore.onlineUsers = users;
  //   },

  //   "receipt.delivered": (data) => {
  //     const receipts = data.payload.receipts;
  //     if (!receipts) return;
  //     receiptManager.handleIncomingReceipts(receipts);
  //   },

  //   "receipt.read": (data) => {
  //     const receipts = data.payload.receipts;
  //     if (!receipts) return;
  //     receiptManager.handleIncomingReceipts(receipts);
  //   },

  //   "receipt.mark_all_read": (data) => {},

  //   notification: async (messagePayload: ServerMessageType) => {
  //     const conversationId = messagePayload.payload.message.conversationId;
  //     const message = messagePayload.payload.message as Message;
  //     const userId = messagePayload.payload.recipient.id;

  //     const isActiveConversation =
  //       chatStore.activeConversation?.conversationId === conversationId;

  //     if (isActiveConversation) {
  //       if (virtualStore.isAtBottom) {
  //         await receiptManager.emitMarkRead({
  //           message,
  //           userId,
  //         });
  //       } else {
  //         await receiptManager.emitMarkDelivered({
  //           message,
  //           userId,
  //         });

  //         chatStore.addUnreadMessage(conversationId!, message.messageId);
  //       }
  //     }
  //   },
};
