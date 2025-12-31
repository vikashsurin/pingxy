import { chatStore } from "$lib/store.svelte.js";

import type {
  Connection,
  Message,
  User,
  Room,
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

    if (data.type === "join_room") {
      console.log("joined room");
      chatStore.joinedRooms.add(data.roomId);
    }
    if (data.type === "rejoin_room") {
      console.log("Rejoined room:", data.roomId);
    }

    if (data.type === "leave_room") {
      chatStore.joinedRooms.delete(data.roomId);
    }
    if (data.type === "room_list") {
      const rooms: Room[] = data.rooms;
      chatStore.setRooms(rooms);
    }

    if (data.type === "room_created") {
      const room: Room = data.room;
      chatStore.addRoom(room);
    }

    if (data.type === "room_updated") {
      const room: Room = data.room;
      chatStore.updateRoom(room);
    }

    if (data.type === "room_deleted") {
      const { roomId } = data;
      chatStore.removeRoom(roomId);
    }

    if (data.type === "error") {
      console.error("Socket Error:", data.message);
      // TODO: Show toast
    }

    if (data.type === "kicked") {
      const { roomId, roomName } = data;
      if (chatStore.activeChatTarget?.uid === roomId) {
        // Force switch to global
        const globalRoom = chatStore.rooms.get("global");
        if (globalRoom) {
          chatStore.activeChatTarget = globalRoom;
        }
      }
      // Maybe show alert "You were kicked from roomName"
      alert(`You were kicked from ${roomName}`);
    }

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

      // Check if it is a Room Message
      if (message.roomId) {
        const roomId = message.roomId;
        // Ensure we have the room in store? Maybe auto-add if missing?
        // For now assume room_list populated it or we don't care about metadata yet.

        chatStore.messages.set(roomId, [
          ...(chatStore.messages.get(roomId) || []),
          message,
        ]);

        if (chatStore.activeChatTarget?.uid !== roomId) {
          chatStore.addUnread(roomId);
        }
      } else {
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
