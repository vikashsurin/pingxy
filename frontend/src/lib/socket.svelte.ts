import { users, unread, messages, activeSocket } from "$lib/store.svelte.js";

import type { Connection, Message, User } from "../../../shared/src/index";

export let socket: WebSocket | null = null;

export function initSocket() {
  socket = new WebSocket("ws://localhost:8080/ws/");

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
          type: "message",
          kind: "system",
          text: c.text!,
          recipientId: "global",
          timestamp: Date.now(),
        };
        messages.set("global", [...(messages.get("global") || []), message]);

        users.delete(user.uid!);
      }
      if (c.status === "join") {
        const user: User = c.user;

        // update notification message when user joins
        const message: Message = {
          type: "message",
          kind: "system",
          text: c.text!,
          recipientId: "global",
          timestamp: Date.now(),
        };

        messages.set("global", [...(messages.get("global") || []), message]);

        users.set(user.uid!, user);
      }
      return;
    }

    // update with new messages
    if (data.type === "message") {
      const message: Message = data;
      const recipientId = message.recipientId!;
      const senderId = message.senderId!;

      if (recipientId === "global") {
        messages.set("global", [...(messages.get("global") || []), message]);
      } else {
        const senderId = message.senderId!;
        messages.set(senderId, [...(messages.get(senderId) || []), message]);
      }

      // update unread messages
      if (activeSocket?.uid !== senderId) {
        if (recipientId === "global") return;
        unread.add(senderId);
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
