import type { WebSocketHandler } from "bun";
import { validateConnection, validateMessage } from "./utils";
import {
  type Connection,
  type Message,
  type User,
} from "../../shared/src/lib/utils/validation.js";
import { users, userSockets } from "./state";

type WebSocketData = {
  user: User;
};

export const socketHandlers: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {
    console.log(`${ws.data.user.username} joined`);

    // auto subscribe to the global channel
    ws.subscribe("global");



    function getConnectionStatus() {
      return userSockets.get(ws.data.user.uid) ? "reconnect" : "join";
    }

    function getConnectionText(status: Connection["status"]) {
      return `${ws.data.user.username} has ${status === "reconnect" ? "reconnected" : "joined the chat"
        }.`;
    }

    // updated connection
    const connection: Connection = {
      type: "connection",
      status: getConnectionStatus(),

      text: getConnectionText(getConnectionStatus()),
      user: ws.data.user,
    };

    // connection object
    const validConnection = validateConnection(connection);

    ws.publish(
      "global",
      JSON.stringify({
        ...validConnection,
      })
    );

    // save the userSocket
    userSockets.set(ws.data.user.uid, ws);
  },

  message(ws, message) {
    if (typeof message !== "string") return;

    let msg: Message | any = null;

    try {
      msg = JSON.parse(message);
    } catch (error) {
      return;
    }

    if (!msg || typeof msg !== "object") return;

    // Handle read receipts and typing events
    if (msg.type === "read_receipt" || msg.type === "typing") {
      const recipientSocket = userSockets.get(msg.recipientId);
      if (recipientSocket) {
        recipientSocket.send(JSON.stringify(msg));
      }
      return;
    }

    // Handle regular messages
    msg.senderId = ws.data.user.uid;
    msg.senderName = ws.data.user.username;

    const validMessage = validateMessage(msg);

    if (!validMessage) return;

    const recipientSocket = userSockets.get(validMessage.recipientId);

    if (recipientSocket) {
      recipientSocket.send(JSON.stringify({ ...validMessage }));
    } else {
      // Assume channel (global)
      if (validMessage.recipientId) {
        ws.publish(validMessage.recipientId, JSON.stringify({ ...validMessage }));
      }
    }
  },
  close(ws) {
    console.log("closed connection");
    const uid = ws.data.user.uid;

    // dont sent connection msg if,
    // user has not really logged out
    if (users.has(uid)) return;

    const connection: Connection = {
      type: "connection",
      status: "leave",
      text: `${ws.data.user.username} has left the chat.`,
      user: ws.data.user,
    };

    const validConnection = validateConnection(connection);

    ws.publish("global", JSON.stringify({ ...validConnection }));
  },
};


