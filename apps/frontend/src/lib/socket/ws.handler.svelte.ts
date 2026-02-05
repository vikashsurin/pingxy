import * as messageManager from "$lib/store/managers/message.svelte";
import * as receiptManager from "$lib/store/managers/receipt.svelte";
import { chatStore } from "$lib/store/store.svelte";
import { virtualStore } from "$lib/store/virtualStore.svelte";
import type {
  Message,
  ServerNewMessageType,
  ServerReceiptStatusType,
} from "@pingxy/shared";

export const messageHandler: Record<string, (data: any) => void> = {
  "message.new": (data) => {
    console.log("new message arrived");
    messageManager.handleIncomingMessage(data);
  },
  "users.online": (data) => {
    const { users } = data.payload;
    chatStore.onlineUsers = users;
  },
  "receipt.update.status": (messagePayload: ServerReceiptStatusType) => {
    console.log({ messagePayload });
    const receipts = messagePayload.payload.receipts;
    if (!receipts) return;
    receiptManager.handleIncomingReceipts(receipts);
  },

  notification: async (messagePayload: ServerNewMessageType) => {
    const conversationId = messagePayload.payload.message.conversationId;
    const message = messagePayload.payload.message as Message;
    const userId = messagePayload.payload.recipient.id;

    const isActiveConversation =
      chatStore.activeConversation?.conversationId === conversationId;

    if (isActiveConversation) {
      if (virtualStore.isAtBottom) {
        await receiptManager.emitMarkRead({
          message,
          userId,
        });
      } else {
        await receiptManager.emitMarkDelivered({
          message,
          userId,
        });

        chatStore.addUnreadMessage(conversationId!, message.messageId);
      }
    }
  },
};
