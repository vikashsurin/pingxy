import { markAsDelivered, markAsRead, receiptHandlers } from "$lib/store/storeHelper.svelte";
import { chatStore } from "$lib/store/store.svelte";
import { virtualStore } from "$lib/store/virtualStore.svelte";
import type { Message, ServerNewMessageType, ServerReceiptStatusType } from "@pingxy/shared";
import { handleNewMessage } from "./service.svelte";

export const messageHandler: Record<string, (data: any) => void> = {
  "message.new": (data) => {
    handleNewMessage(data);
  },
  "users.online": (data) => {
    const { users } = data.payload;
    chatStore.onlineUsers = users;
  },
  "receipt.update.status": (messagePayload: ServerReceiptStatusType) => {
    console.log({ messagePayload });
    const receipts = messagePayload.payload.receipts;
    if (!receipts?.length) return;

    for (const receipt of receipts) {
      receiptHandlers[receipt.status]?.(receipt);
    }
  },

  notification: async (messagePayload: ServerNewMessageType) => {
    const conversationId = messagePayload.payload.message.conversation_id;
    const message = messagePayload.payload.message as Message;
    const user_id = messagePayload.payload.recipient.id;

    const isActiveConversation = chatStore.activeConversation?.conversation_id === conversationId;

    // Mark as read, if active conversation is the same as the received message
    // TODO: also can check if the scroll position is at the bottom, for precision
    if (isActiveConversation) {
      if (virtualStore.isAtBottom) {
        await markAsRead({
          message,
          user_id,
        });
      } else {
        await markAsDelivered({
          message,
          user_id,
        });

        chatStore.addUnreadMessage(conversationId!, message.message_id);
      }
    }
  },
};
