import { chatStore } from "$lib/store.svelte.js";
import type { SocketMessage } from "@chat/shared/src/lib/utils/validation";

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
  system: (message: SocketMessage) => {},
  message: (message: SocketMessage) => {},
  new_conversation: (message: SocketMessage) => {
    console.log({ message });
    const newMessage: SocketMessage = {
      type: "subscribe",
      id: crypto.randomUUID(),
      conversationId: message.conversationId,
      timestamp: new Date().toISOString(),
    };
    socket?.send(JSON.stringify(newMessage));
  },
  user_join: (message: SocketMessage) => {},
  user_leave: (message: SocketMessage) => {},
  users_online: (message: SocketMessage) => {
    chatStore.onlineUsers = message.users;
  },
  user_offline: (message: SocketMessage) => {
    const id = message.users.id;
    const updatedOnlineUsers = chatStore.onlineUsers.filter((u) => u.id !== id);
    chatStore.onlineUsers = updatedOnlineUsers;
  },
  message_receipts: (message: SocketMessage) => {},
  typing: (message: SocketMessage) => {},
  error: (message: SocketMessage) => {},
};

export function getSocket() {
  return socket;
}
