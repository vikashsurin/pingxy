import type { WebSocketHandler } from "bun";
import { validateConnection, validateMessage } from "./utils";
import {
  type Connection,
  type User,
  readReceiptSchema,
  typingEventSchema,
} from "../../shared/src/lib/utils/validation.js";
import { userSockets, announcedUsers } from "./state";
import { createMessage, getGlobalMessages, getDirectMessages } from "./db";

type WebSocketData = {
  user: User;
};

export const socketHandlers: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {


    console.log(`${ws.data.user.username} joined`);

    // auto subscribe to the global channel
    ws.subscribe("global");

    // Send history for global chat
    // This might be better as a separate request, but for now we send it on join.
    // The frontend should handle receiving a list of messages?
    // Or we send them one by one? 
    // Usually bulk is better but requires frontend support for "history" type.
    // Given the current frontend structure, sending one by one might be easier BUT efficient.
    // Let's assume we can send them one by one for now or just wait for frontend "fetch_history".

    // Actually, let's just trigger a history send. 
    const globalMsgs = getGlobalMessages(20); // Last 20
    // Send in reverse order (oldest first) so they append correctly? 
    // getGlobalMessages returns oldest first (ASC) based on query mod.
    // Wait, query in db.ts: ORDER BY m.timestamp ASC. So yes.

    // We send them as individual messages.
    for (const msg of globalMsgs) {
      ws.send(JSON.stringify(msg));
    }

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
      // Assume channel (global)
      if (validMessage.recipientId) {
        // DM but user offline
        // Do nothing, they will fetch on load.
      } else {
        // Global message
        ws.publish("global", JSON.stringify(validMessage));
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
  // TODO: Update read status in DB?
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


