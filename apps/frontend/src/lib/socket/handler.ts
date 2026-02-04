import { messageManager } from "$lib/store/managers/message.svelte";
import { receiptManager } from '$lib/store/managers/receipt.svelte';
import { chatStore } from "$lib/store/store.svelte";
import { virtualStore } from "$lib/store/virtualStore.svelte";
import type { Message, ServerNewMessageType, ServerReceiptStatusType } from "@pingxy/shared";

export const messageHandler: Record<string, (data: any) => void> = {
  "message.new": (data) => {
    console.log("new message arrived")
    messageManager.handleMessage(data);
  },
  "users.online": (data) => {
    const { users } = data.payload;
    chatStore.onlineUsers = users;
  },
  "receipt.update.status": (messagePayload: ServerReceiptStatusType) => {
    console.log({ messagePayload });
    const receipts = messagePayload.payload.receipts;
    if (!receipts) return;
    receiptManager.handleReceiptUpdate(receipts);
  },

  notification: async (messagePayload: ServerNewMessageType) => {
    const conversationId = messagePayload.payload.message.conversation_id;
    const message = messagePayload.payload.message as Message;
    const user_id = messagePayload.payload.recipient.id;

    const isActiveConversation = chatStore.activeConversation?.conversation_id === conversationId;

    if (isActiveConversation) {
      if (virtualStore.isAtBottom) {
        await receiptManager.markAsRead({
          message,
          user_id,
        });
      } else {
        await receiptManager.markAsDelivered({
          message,
          user_id,
        });

        chatStore.addUnreadMessage(conversationId!, message.message_id);
      }
    }
  },
};
