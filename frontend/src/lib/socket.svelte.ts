import { chatStore } from "$lib/store.svelte.js";

import type { Connection, Message, User } from "../../../shared/src/index";

export let socket: WebSocket | null = null;

function getWebSocketUrl() {
  // Use current host (works in dev and production)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/`;
}

export function initSocket() {
  // the browser will only connect to the websocket  port
  // which is accesible via browser not inside the container
  // socket = new WebSocket(getWebSocketUrl());
  socket = new WebSocket("ws://localhost:3000/ws/");

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

      if (recipientId === "global") {
        chatStore.messages.set("global", [
          ...(chatStore.messages.get("global") || []),
          message,
        ]);
      } else {
        const senderId = message.senderId!;
        chatStore.messages.set(senderId, [
          ...(chatStore.messages.get(senderId) || []),
          message,
        ]);
      }

      // update unread messages
      if (chatStore.activeChat?.uid !== senderId) {
        if (recipientId === "global") return;
        chatStore.unread.add(senderId);
      }
    }
  });

  socket.addEventListener("close", (event) => {
    console.log("disconnected");
  });
}

export function getSocket() {
  return socket;
}
