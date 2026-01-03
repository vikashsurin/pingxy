import type { WebSocketHandler } from "bun";
import { validateConnection, validateMessage } from "./utils";
import {
  type Connection,
  ReadReceipt,
  type User,
  readReceiptSchema,
  typingEventSchema,
} from "../../../packages/shared/src/lib/utils/validation.js";

import { userSockets, announcedUsers } from "./state";
import { createMessage, markMessagesAsRead } from "./db/messages";

type WebSocketData = {
  user: User;
};

export const socketHandlers: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {
    // Check for Ban
    const { isBanned } = require("./db/users"); // Lazy require/import
    const banStatus = isBanned(ws.data.user.uid);
    if (
      banStatus.banned &&
      (!banStatus.expires_at || banStatus.expires_at * 1000 > Date.now())
    ) {
      ws.send(
        JSON.stringify({
          type: "system",
          text: "You are banned: " + banStatus.reason,
        })
      );
      ws.close();
      return;
    }

    console.log(`${ws.data.user.username} joined`);

    // auto subscribe to the global channel
    ws.subscribe("global");

    const uid = ws.data.user.uid;
    const isAnnounced = announcedUsers.has(uid);

    if (!isAnnounced) {
      const status = getConnectionStatus(uid);
      const text = getConnectionText(ws.data.user.username, status);

      // updated connection
      const connection: Connection = {
        type: "connection",
        status,
        text,
        user: ws.data.user,
      };

      // connection object
      const validConnection = validateConnection(connection);
      if (!validConnection) return;

      ws.publish("global", JSON.stringify(validConnection));
      announcedUsers.add(uid);
    } else {
      // Just send to the user so they know they are connected
      // We can reuse the connection structure or just a simpleack?
      // Let's send a "reconnect" status just to them.
      const connection: Connection = {
        type: "connection",
        status: "reconnect",
        text: `Welcome back ${ws.data.user.username}`,
        user: ws.data.user,
      };
      const validConnection = validateConnection(connection);
      if (validConnection) {
        ws.send(JSON.stringify(validConnection));
      }
    }

    // save the userSocket
    userSockets.set(ws.data.user.uid, ws);
  },

  async message(ws, message) {
    if (typeof message !== "string") return;

    let msg: any;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    if (!msg || typeof msg !== "object") return;

    // Check for Ban (in case they got banned while connected)
    const { isBanned } = require("./db/users");
    const banStatus = isBanned(ws.data.user.uid);
    if (banStatus.banned) {
      ws.send(JSON.stringify({ type: "error", message: "You are banned." }));
      ws.close();
      return;
    }

    // Handle read receipts and typing events
    if (msg.type === "read_receipt") {
      const success = handleReadReceipt(msg);
      if (!success) {
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid read receipt." })
        );
      }

      return;
    }

    if (msg.type === "typing") {
      handleTypingEvent(msg, ws);
      return;
    }

    // Handle regular messages
    msg.senderId = ws.data.user.uid;
    msg.senderName = ws.data.user.username;

    // Ensure ID exists (if not provided by frontend)
    if (!msg.id) {
      msg.id = crypto.randomUUID();
    }

    const validMessage = validateMessage(msg);
    if (!validMessage) return;

    // Persist message
    createMessage(validMessage);

    const recipientSocket = userSockets.get(validMessage.recipientId);

    if (recipientSocket) {
      recipientSocket.send(JSON.stringify(validMessage));
      // Also send to self (sender) if it wasn't optimistic?
      // Usually sender has it.
    } else {
      // DM but user offline
      // Do nothing, they will fetch on load.
    }
  },

  close(ws) {
    console.log("closed connection");
    const uid = ws.data.user.uid;

    // Always clean up the socket
    userSockets.delete(uid);

    // Only broadcast "leave" if the user is truly gone (logged out)
    // This prevents "flickering" presence when reloading or closing tabs but staying logged in.
    if (announcedUsers.has(uid)) return;

    const connection: Connection = {
      type: "connection",
      status: "leave",
      text: `${ws.data.user.username} has left the chat.`,
      user: ws.data.user,
    };

    const validConnection = validateConnection(connection);
    if (validConnection) {
      ws.publish("global", JSON.stringify(validConnection));
    }
  },
};

// --- Helpers ---

function getConnectionStatus(uid: string): Connection["status"] {
  return userSockets.has(uid) ? "reconnect" : "join";
}

function getConnectionText(username: string, status: Connection["status"]) {
  return `${username} has ${status === "reconnect" ? "reconnected" : "joined the chat"
    }.`;
}

function handleReadReceipt(msg: ReadReceipt): boolean {
  const result = readReceiptSchema.safeParse(msg);
  if (!result.success) return false;

  const success = markMessagesAsRead(
    result.data.recipientId,
    result.data.senderId
  );
  const recipientSocket = userSockets.get(result.data.recipientId);
  if (success && recipientSocket) {
    recipientSocket.send(JSON.stringify(result.data));
  }
  return true;
}

function handleTypingEvent(msg: any, ws: any) {
  // ws passed for room broadcast
  const result = typingEventSchema.safeParse(msg);
  if (!result.success) return;
  const validMsg = result.data;

  if (validMsg.recipientId) {
    const recipientSocket = userSockets.get(validMsg.recipientId);
    if (recipientSocket) {
      recipientSocket.send(JSON.stringify(validMsg));
    }
  }
}
