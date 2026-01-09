import type { WebSocketHandler } from "bun";
import { broadcastUserOffline, broadcastOnlineUsers } from "./socketHelpers";

import {
  PublicUser,
  MessagePayload,
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
  system: (ws, message: MessagePayload) => { },
  message: (ws, message: MessagePayload) => {

  },
  new_conversation: (ws, message: MessagePayload) => {
  },
  open_conversation: (ws, message: MessagePayload) => {
    const conversationId = message.data?.conversation_id
    ws.data.activeConversations.add(conversationId!.toString());
    ws.subscribe(conversationId!.toString());
    console.log("subscribed")
  },
  subscribe: (ws, message: MessagePayload) => {
    const conversationId = message.message?.conversation_id?.toString()
    ws.subscribe(conversationId!)
  },
  close_conversation: (ws, message: MessagePayload) => {
    const conversationId = message.message?.conversation_id?.toString()
    ws.data.activeConversations.delete(conversationId!)
    ws.unsubscribe(conversationId!);

    return

  },
  user_join: (ws, message: MessagePayload) => { },
  users_online: (ws, message: MessagePayload) => { },
  user_online: (ws, message: MessagePayload) => { },
  user_offline: (ws, message: MessagePayload) => {
    const id = message.message?.sender_id;
    // const username = message;
    // broadcastUserOffline(id, username);
  },
  user_leave: (ws, message: MessagePayload) => {
    console.log(message);
  },
  message_receipt: (ws, message: MessagePayload) => {
    console.log(message);
  },
  typing: (ws, message: MessagePayload) => {
    console.log(message);
  },
  error: (ws, message: MessagePayload) => {
    console.log(message);
  },
};

// update every 30 seconds
// setInterval(() => {
//   broadcastOnlineUsers();
// }, 30000);
