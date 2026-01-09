import { chatStore } from "$lib/store.svelte.js";
import type { Message, MessagePayload } from "@chat/shared/src/lib/utils/validation";

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
  system: (messagePayload: MessagePayload) => { },
  message: (messagePayload: MessagePayload) => {
    chatStore.messages
      .get(messagePayload.message?.conversation_id!)
      ?.push(messagePayload.message! as Message)

  },

  notification: (messagePayload: MessagePayload) => {
    const conversationId = messagePayload?.message?.conversation_id;
    if (chatStore.activeConversation?.conversation_id === conversationId) {
      return
    } else {
      console.log('new message notification!')
      chatStore.notifications.add(conversationId!)
    }

  },
  new_conversation: (messagePayload: MessagePayload) => {
    // const conversationId = messagePayload.message.conversation_id;
    // chatStore.conversations.add(conversationId!);
    // chatStore.messages.set(conversationId!, message)
  },
  user_join: (messagePayload: MessagePayload) => { },
  user_leave: (messagePayload: MessagePayload) => { },
  users_online: (messagePayload: MessagePayload) => {
    chatStore.onlineUsers = messagePayload?.data?.users;
  },
  user_offline: (messagePayload: MessagePayload) => {
    // const id = messagePayload.users.id;
    // const updatedOnlineUsers = chatStore.onlineUsers.filter((u) => u.id !== id);
    // chatStore.onlineUsers = updatedOnlineUsers;
  },
  message_receipts: (messagePayload: MessagePayload) => { },
  typing: (messagePayload: MessagePayload) => { },
  error: (message: MessagePayload) => { },
};

export function getSocket() {
  return socket;
}
