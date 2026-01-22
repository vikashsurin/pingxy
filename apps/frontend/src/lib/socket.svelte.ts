import { chatStore, type ChatEntry } from "$lib/store/store.svelte.js";
import type {
  Message,
  MessagePayload,
  MessageReceipt,
} from "@chat/shared/types";
import {
  markAsDelivered,
  markAsRead,
  receiptHandlers,
} from "./store/storeHelper.svelte";
import { virtualStore } from "./store/virtualStore.svelte";

export let socket: WebSocket | null = null;

function getWebSocketUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  // Helper for development: if on Vite default port, point to Backend port
  if (window.location.port === "5173") {
    return `${protocol}//${window.location.hostname}:3000/ws/`;
  }

  // Production or Docker/Nginx: use relative path
  return `${protocol}//${window.location.host}/ws/`;
}

export function initSocket() {
  if (socket?.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(getWebSocketUrl());

  socket.addEventListener("open", (event) => {
    console.log("connected");
    chatStore.isConnected = true;
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    const handler = messageHandler[data.type];
    if (handler) {
      handler(data);
    }
  });

  socket.addEventListener("close", (event) => {
    console.log("disconnected");
    chatStore.isConnected = false;
  });
}

// MESSAGE HANDLER
const messageHandler: Record<string, (data: any) => void> = {
  system: (messagePayload: MessagePayload) => {},
  message: (messagePayload: MessagePayload) => {
    const msgData = messagePayload.msgData as ChatEntry;
    const conversation_id = msgData.message.conversation_id;

    if (!chatStore.messages[conversation_id]) {
      chatStore.messages[conversation_id] = {};
    }
    chatStore.messages[conversation_id][msgData.message.message_id] = msgData;
  },

  receipt_update: (messagePayload: MessagePayload) => {
    console.log({ messagePayload });

    const receipts = messagePayload.msgData?.receipt as MessageReceipt[];
    if (!receipts?.length) return;

    for (const receipt of receipts) {
      receiptHandlers[receipt.status]?.(receipt);
    }
  },

  notification: async (messagePayload: MessagePayload) => {
    const conversationId = messagePayload.msgData?.message?.conversation_id;
    const message = messagePayload.msgData?.message as Message;
    const user_id = messagePayload.recipient?.id!;
    const isActiveConversation =
      chatStore.activeConversation?.conversation_id === conversationId;

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

  new_conversation: (messagePayload: MessagePayload) => {
    // const conversationId = messagePayload.message.conversation_id;
    // chatStore.conversations.add(conversationId!);
    // chatStore.messages.set(conversationId!, message)
  },

  user_join: (messagePayload: MessagePayload) => {},
  user_leave: (messagePayload: MessagePayload) => {},
  users_online: (messagePayload: MessagePayload) => {
    chatStore.onlineUsers = messagePayload?.data?.users;
  },

  user_offline: (messagePayload: MessagePayload) => {
    // const id = messagePayload.users.id;
    // const updatedOnlineUsers = chatStore.onlineUsers.filter((u) => u.id !== id);
    // chatStore.onlineUsers = updatedOnlineUsers;
  },

  message_receipts: (messagePayload: MessagePayload) => {},
  typing: (messagePayload: MessagePayload) => {},
  error: (message: MessagePayload) => {},
};

export function getSocket() {
  return socket;
}
