import { chatStore } from "$lib/store.svelte.js";

import type {
  Connection,
  Message,
  User,
} from "../../../shared/src/lib/utils/validation.js";

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
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "error") {
      console.error("Socket Error:", data.message);
      // TODO: Show toast
    }

    // update user list
    if (data.type === "connection") {
      const c: Connection = data;
      if (c.status === "reconnect") return;

      if (c.status === "leave") {
        const user: User = c.user;

        chatStore.users.delete(user.uid!);
      }
      if (c.status === "join") {
        const user: User = c.user;

        chatStore.users.set(user.uid!, user);
      }
      return;
    }

    // update with new messages
    if (data.type === "message") {
      const message: Message = data;

      // Direct Message
      const senderId = message.senderId!;
      // If I sent it, it should go to recipient's conversation?
      // But incoming message is usually from someone else.
      // Unless it's a sync from other session.

      chatStore.messages.set(senderId, [
        ...(chatStore.messages.get(senderId) || []),
        message,
      ]);

      // update unread messages
      if (chatStore.activeChatTarget?.uid !== senderId) {
        chatStore.addUnread(senderId);
      } else if (
        chatStore.activeChatTarget?.uid === senderId &&
        chatStore.currentUser
      ) {
        // Send read receipt if active
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "read_receipt",
              messageId: message.id,
              senderId: chatStore.currentUser.uid,
              recipientId: senderId,
            })
          );
        }
      }
    }

    // handle read receipts
    if (data.type === "read_receipt") {
      const { messageId, senderId, recipientId } = data; // senderId here is who READ the message

      // Find the message in our local store and update status
      const chatMessages = chatStore.messages.get(senderId) || [];
      const updatedMessages = chatMessages.map((msg) =>
        msg.id === messageId ? { ...msg, status: "read" } : msg
      );
      // @ts-ignore
      chatStore.messages.set(senderId, updatedMessages);
    }

    // handle typing events
    if (data.type === "typing") {
      const { isTyping, senderId } = data;
      chatStore.setTyping(senderId, isTyping);
    }
  });

  socket.addEventListener("close", (event) => {
    console.log("disconnected");
  });
}

export function getSocket() {
  return socket;
}
