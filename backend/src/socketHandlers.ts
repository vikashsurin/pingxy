import type { WebSocketHandler } from "bun";
import { validateConnection, validateMessage } from "./utils";
import { Connection, Message } from "../../shared/src/validation";

import { users, userSockets } from "./index";

type WebSocketData = {
  uid: string;
  username: string;
};

export const socketHandlers: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {
    console.log(`${ws.data.username} joined`);

    // auto subscribe to the global channel
    ws.subscribe("global");

    function getConnectionStatus() {
      return userSockets.get(ws.data.uid) ? "reconnect" : "join";
    }

    function getConnectionText(status: Connection["status"]) {
      return `${ws.data.username} has ${
        status === "reconnect" ? "reconnected" : "joined the chat"
      }.`;
    }

    // updated connection
    const connection: Connection = {
      type: "connection",
      status: getConnectionStatus(),
      uid: ws.data.uid,
      username: ws.data.username,
      text: getConnectionText(getConnectionStatus()),
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
    userSockets.set(ws.data.uid, ws);
  },

  message(ws, message) {
    if (typeof message !== "string") return;

    let msg: Message | null = null;

    try {
      msg = JSON.parse(message);
    } catch (error) {
      return;
    }

    if (!msg || typeof msg !== "object") return;

    msg.senderId = ws.data.uid;
    msg.senderName = ws.data.username;

    const validMessage = validateMessage(msg);

    if (validMessage?.recipientId === "global" || !validMessage?.recipientId) {
      ws.publish("global", JSON.stringify({ ...validMessage }));
    } else {
      const recipientSocket = userSockets.get(validMessage?.recipientId);
      if (recipientSocket) {
        recipientSocket.send(JSON.stringify({ ...validMessage }));
      }
    }
  },
  close(ws) {
    console.log("closed connection");
    const uid = ws.data.uid;

    // dont sent connection msg if,
    // user has not really logged out
    if (users.has(uid)) return;

    const connection: Connection = {
      type: "connection",
      status: "leave",
      uid: uid,
      username: ws.data.username,
      text: `${ws.data.username} has left the chat.`,
    };

    const validConnection = validateConnection(connection);

    ws.publish("global", JSON.stringify({ ...validConnection }));
  },
};
