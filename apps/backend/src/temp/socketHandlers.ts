import {
  type Connection,
  ReadReceipt,
  readReceiptSchema,
  typingEventSchema,
} from "@chat/shared/src/lib/utils/tempp";
import type { WebSocketHandler } from "bun";
import { validateConnection } from "../utils";
import { broadcastUserOffline, broadcastOnlineUsers } from "./socketHelpers";

import {
  PublicUser,
  MessagePayload,
} from "@chat/shared/src/lib/utils/validation";

import { userSockets } from "../state";
import { json } from "drizzle-orm/singlestore-core";

type WebSocketData = {
  user: PublicUser;
};

export const socketHandlers: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {
    const user = ws.data.user;
    console.log(`${user.username} joined`);

    // save the userSocket
    userSockets.set(ws.data.user.id, {
      socket: ws,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      roomId: null,
      username: ws.data.user.username,
    });

    // console.log({ userSockets })

    // Socket Message
    // const socketMessage: MessagePayload = {
    //   type: "system",
    //   id: crypto.randomUUID(),
    //   timestamp: Date.now().toString(),
    //   content: {
    //     text: `${ws.data.user.username} has joined the chat.`,
    //   },
    // };
    //
    broadcastOnlineUsers();

    // ws.publish('online')

    // auto subscribe to the global channel
    // ws.subscribe("global");
    // ws.send(JSON.stringify(socketMessage));
    // const id = ws.data.user.id;
    // const isAnnounced = announcedUsers.has(id);

    // if (!isAnnounced) {
    //   const status = getConnectionStatus(id);
    //   const text = getConnectionText(ws.data.user.username, status);

    //   // updated connection
    //   const connection = {
    //     type: "connection",
    //     status,
    //     text,
    //     user: ws.data.user,
    //   };

    //   // connection object
    //   // const validConnection = validateConnection(connection);
    //   // if (!validConnection) return;

    //   ws.publish("global", JSON.stringify(validConnection));
    //   // announcedUsers.add(id);
    // } else {
    //   // Just send to the user so they know they are connected
    //   // We can reuse the connection structure or just a simpleack?
    //   // Let's send a "reconnect" status just to them.
    //   const connection: Connection = {
    //     type: "connection",
    //     status: "reconnect",
    //     text: `Welcome back ${ws.data.user.username}`,
    //     user: ws.data.user,
    //   };
    //   const validConnection = validateConnection(connection);
    //   if (validConnection) {
    //     ws.send(JSON.stringify(validConnection));
    //   }
    // }
    //

    // console.log({ userSockets });
  },

  async message(ws, message) {
    if (typeof message !== "string") return;

    const data = JSON.parse(message);
    const handler = messageHandler[data.type];
    if (handler) {
      handler(data);
    }
    // if (typeof message !== "string") return;
    // let msg: any;
    // try {
    //   msg = JSON.parse(message);
    // } catch {
    //   return;
    // }
    // if (!msg || typeof msg !== "object") return;
    // // Check for Ban (in case they got banned while connected)
    // const { isBanned } = require("./db/users");
    // const banStatus = isBanned(ws.data.user.id);
    // if (banStatus.banned) {
    //   ws.send(JSON.stringify({ type: "error", message: "You are banned." }));
    //   ws.close();
    //   return;
    // }
    // // Handle read receipts and typing events
    // if (msg.type === "read_receipt") {
    //   const success = handleReadReceipt(msg);
    //   if (!success) {
    //     ws.send(
    //       JSON.stringify({ type: "error", message: "Invalid read receipt." })
    //     );
    //   }
    //   return;
    // }
    // if (msg.type === "typing") {
    //   handleTypingEvent(msg, ws);
    //   return;
    // }
    // // Handle regular messages
    // msg.senderId = ws.data.user.id;
    // msg.senderName = ws.data.user.username;
    // // Ensure ID exists (if not provided by frontend)
    // if (!msg.id) {
    //   msg.id = crypto.randomUUID();
    // }
    // const validMessage = validateMessage(msg);
    // if (!validMessage) return;
    // // Persist message
    // createMessage(validMessage);
    // const recipientSocket = userSockets.get(validMessage.recipientId);
    // if (recipientSocket) {
    //   recipientSocket.send(JSON.stringify(validMessage));
    //   // Also send to self (sender) if it wasn't optimistic?
    //   // Usually sender has it.
    // } else {
    //   // DM but user offline
    //   // Do nothing, they will fetch on load.
    // }
  },

  close(ws) {
    console.log("closed connection");
    const id = ws.data.user.id;

    // Always clean up the socket
    // userSockets.delete(id);

    // Only broadcast "leave" if the user is truly gone (logged out)
    // This prevents "flickering" presence when reloading or closing tabs but staying logged in.
    // if (announcedUsers.has(id)) return;

    // const connection = {
    //   type: "connection",
    //   status: "leave",
    //   text: `${ws.data.user.username} has left the chat.`,
    //   user: ws.data.user,
    // };

    // const validConnection = validateConnection(connection);
    // if (validConnection) {
    //   ws.publish("global", JSON.stringify(validConnection));
    // }
  },
};

// --- Helpers ---

const messageHandler: Record<string, (data: any) => void> = {
  system: (data: any) => {},
  message: (data: any) => {
    console.log(data);
  },
  user_join: (data: any) => {},
  users_online: (data: any) => {},
  user_offline: (data: MessagePayload) => {
    const id = data.sender?.id!;
    const username = data.sender?.username!;
    broadcastUserOffline(id, username);
  },
  user_leave: (data: any) => {
    console.log(data);
  },
  message_receipt: (data: any) => {
    console.log(data);
  },
  typing: (data: any) => {
    console.log(data);
  },
  error: (data: any) => {
    console.log(data);
  },
};

// update every 30 seconds
// setInterval(() => {
//   broadcastOnlineUsers();
// }, 30000);

function getConnectionStatus(id: string): Connection["status"] {
  return userSockets.has(id) ? "reconnect" : "join";
}

function getConnectionText(username: string, status: Connection["status"]) {
  return `${username} has ${
    status === "reconnect" ? "reconnected" : "joined the chat"
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

// temporary
function markMessagesAsRead(recipientId: string, senderId: string): boolean {
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
