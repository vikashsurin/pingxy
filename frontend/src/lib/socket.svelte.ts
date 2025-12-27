import { chatStore } from "$lib/store.svelte.js";

import type { Connection, Message, User } from "../../../shared/src/lib/utils/validation.js";

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



    // update user list
    if (data.type === "connection") {
      const c: Connection = data;
      if (c.status === "reconnect") return;

      if (c.status === "leave") {
        const user: User = c.user;

        // update notification message when user leaves
        const message: Message = {
          id: crypto.randomUUID(),
          type: "message",
          kind: "system",
          text: c.text!,
          recipientId: "global",
          timestamp: Date.now(),
          status: "sent",
        };
        chatStore.messages.set("global", [
          ...(chatStore.messages.get("global") || []),
          message,
        ]);

        chatStore.users.delete(user.uid!);
      }
      if (c.status === "join") {
        const user: User = c.user;

        // update notification message when user joins
        const message: Message = {
          id: crypto.randomUUID(),
          type: "message",
          kind: "system",
          text: c.text!,
          recipientId: "global",
          timestamp: Date.now(),
          status: "sent",
        };

        chatStore.messages.set("global", [
          ...(chatStore.messages.get("global") || []),
          message,
        ]);

        chatStore.users.set(user.uid!, user);
      }
      return;
    }



    // update with new messages
    if (data.type === "message") {
      const message: Message = data;
      const recipientId = message.recipientId!;
      const senderId = message.senderId!;

      // Check if recipient is a local room 
      // (Global is a room, but we might have other rooms too)
      if (chatStore.rooms.has(recipientId)) {
        chatStore.messages.set(recipientId, [
          ...(chatStore.messages.get(recipientId) || []),
          message,
        ]);

        if (chatStore.activeChat?.uid !== recipientId) {
          chatStore.addUnread(recipientId);
        }
      } else {
        // Direct Message
        const senderId = message.senderId!;
        chatStore.messages.set(senderId, [
          ...(chatStore.messages.get(senderId) || []),
          message,
        ]);

        // update unread messages
        if (chatStore.activeChat?.uid !== senderId) {
          chatStore.addUnread(senderId);
        } else if (chatStore.activeChat?.uid === senderId && chatStore.currentUser) {
          // Send read receipt if active
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'read_receipt',
              messageId: message.id,
              senderId: chatStore.currentUser.uid,
              recipientId: senderId
            }));
          }
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
      console.log('[DEBUG] Received typing event:', data);
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
