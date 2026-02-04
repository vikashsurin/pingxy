import type { WebSocketHandler } from "bun";
import { broadcastOnlineUsers, broadcastUserOffline } from "./socketHelpers";

import { ClientMessageReceiptType } from "@pingxy/shared/types";

import { ReceiptService } from "@modules/receipts";
import { userSockets } from "./state";
import { WebSocketData } from "./types";

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
    ws.subscribe(`inbox:${user.id}`);
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
const messageHandler: Record<
  string,
  (ws: Bun.ServerWebSocket<WebSocketData>, data: any) => void
> = {
  "receipts.mark_all_read": async (ws, data: ClientMessageReceiptType) => {
    if (data.payload.conversation_id && data.payload.user_id) {
      await ReceiptService.processMarkAllRead(data);
    }
  },

  "receipt.delivered": async (ws, messagePayload: ClientMessageReceiptType) => {
    await ReceiptService.processDeliveryReceipt(messagePayload);
  },

  "receipt.read": async (ws, messagePayload: ClientMessageReceiptType) => {
    await ReceiptService.processReadReceipt(messagePayload);
  },

  "conversation.open": (ws, message) => {
    const conversationId = message.data?.conversation_id;
    ws.data.activeConversations.add(conversationId!.toString());
    ws.subscribe(conversationId!.toString());
    console.log("subscribed");
  },

  subscribe: (ws, message) => {
    const conversationId =
      message.msgData?.message?.conversation_id?.toString();
    ws.subscribe(conversationId!);
  },

  close_conversation: (ws, message) => {
    const conversationId =
      message.msgData?.message?.conversation_id?.toString();
    ws.data.activeConversations.delete(conversationId!);
    ws.unsubscribe(conversationId!);

    return;
  },
  error: (ws, message) => {
    console.log(message);
  },
};

// update every 30 seconds
// setInterval(() => {
//   broadcastOnlineUsers();
// }, 30000);
