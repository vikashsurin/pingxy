import type { WebSocketHandler } from "bun";
import { validateConnection, validateMessage } from "./utils";
import {
  type Connection,
  type User,
  readReceiptSchema,
  typingEventSchema,
} from "../../shared/src/lib/utils/validation.js";
import { userSockets, announcedUsers } from "./state";

type WebSocketData = {
  user: User;
};

export const socketHandlers: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {
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

  message(ws, message) {
    if (typeof message !== "string") return;

    let msg: any;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    if (!msg || typeof msg !== "object") return;

    // Handle read receipts and typing events
    if (msg.type === "read_receipt") {
      handleReadReceipt(msg);
      return;
    }

    if (msg.type === "typing") {
      handleTypingEvent(msg);
      return;
    }

    // Handle regular messages
    msg.senderId = ws.data.user.uid;
    msg.senderName = ws.data.user.username;

    const validMessage = validateMessage(msg);
    if (!validMessage) return;

    const recipientSocket = userSockets.get(validMessage.recipientId);

    if (recipientSocket) {
      recipientSocket.send(JSON.stringify(validMessage));
    } else {
      // Assume channel (global)
      if (validMessage.recipientId) {
        ws.publish(validMessage.recipientId, JSON.stringify(validMessage));
      }
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
  return `${username} has ${status === "reconnect" ? "reconnected" : "joined the chat"}.`;
}

function handleReadReceipt(msg: any) {
  const result = readReceiptSchema.safeParse(msg);
  if (!result.success) return;
  const validMsg = result.data;
  const recipientSocket = userSockets.get(validMsg.recipientId);
  if (recipientSocket) {
    recipientSocket.send(JSON.stringify(validMsg));
  }
}

function handleTypingEvent(msg: any) {
  const result = typingEventSchema.safeParse(msg);
  if (!result.success) return;
  const validMsg = result.data;
  const recipientSocket = userSockets.get(validMsg.recipientId);
  if (recipientSocket) {
    recipientSocket.send(JSON.stringify(validMsg));
  }
}


