import type { WebSocketHandler } from "bun";
import { broadcastUserOffline, broadcastOnlineUsers } from "./socketHelpers";

import {
  PublicUser,
  SocketMessage,
} from "@chat/shared/src/lib/utils/validation";

import { userSockets } from "../state";

export type WebSocketData = {
  user: PublicUser;
  activeConversations: Set<string>
};

export const socketHandlers: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {
    const user = ws.data.user;
    console.log(`${user.username} joined`);

    // save the userSocket
    userSockets.set(user.id, {
      socket: ws,
      user: user,
    });
    ws.subscribe(`inbox:${user.id}`)
    broadcastOnlineUsers();

  },

  async message(ws, message) {
    console.log("New Message");
    if (typeof message !== "string") return;

    const data = JSON.parse(message);
    const handler = messageHandler[data.type];
    if (handler) {
      handler(ws, data);
    }
  },

  close(ws) {
    console.log("closed connection");
    const id = ws.data.user.id;
    const username = ws.data.user.username;

    broadcastUserOffline(id, username);
  },
};

// --- Helpers ---
const messageHandler: Record<string, (ws: Bun.ServerWebSocket<WebSocketData>, data: any) => void> = {
  system: (ws, message: SocketMessage) => { },
  message: (ws, message: SocketMessage) => {
    const conversationId = message.conversationId?.toString()
    // const newMessage: SocketMessage = {
    //   type: "message",
    //   id: crypto.randomUUID(),
    //   sender: {
    //     id: message?.sender?.id!,
    //     username: message?.sender?.username!
    //   },
    //   conversationId: Number(conversationId!),
    //   content: {
    //     text:,
    //   },
    //   timestamp: new Date().toISOString()
    // }

    ws.publish(conversationId!, JSON.stringify(message))

  },
  open_conversation: (ws, message: SocketMessage) => {
    const conversationId = message.conversationId?.toString()
    ws.data.activeConversations.add(conversationId!);
    ws.subscribe(conversationId!);

    return
  },
  subscribe: (ws, message: SocketMessage) => {
    const conversationId = message.conversationId?.toString()
    ws.subscribe(conversationId!)
    console.log("Subscribed.")
  },
  close_conversation: (ws, message: SocketMessage) => {
    const conversationId = message.conversationId?.toString()
    ws.data.activeConversations.delete(conversationId!)
    ws.unsubscribe(conversationId!);

    return

  },
  user_join: (ws, message: SocketMessage) => { },
  users_online: (ws, message: SocketMessage) => { },
  user_online: (ws, message: SocketMessage) => { },
  user_offline: (ws, message: SocketMessage) => {
    const id = message.sender?.id!;
    const username = message.sender?.username!;
    broadcastUserOffline(id, username);
  },
  user_leave: (ws, message: SocketMessage) => {
    console.log(message);
  },
  message_receipt: (ws, message: SocketMessage) => {
    console.log(message);
  },
  typing: (ws, message: SocketMessage) => {
    console.log(message);
  },
  error: (ws, message: SocketMessage) => {
    console.log(message);
  },
};

// update every 30 seconds
// setInterval(() => {
//   broadcastOnlineUsers();
// }, 30000);
