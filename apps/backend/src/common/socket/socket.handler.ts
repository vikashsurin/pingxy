import type { WebSocketHandler } from "bun";
import { broadcastOnlineUsers, broadcastUserOffline } from "./socket.helpers";

import { ReceiptService } from "@modules/receipts";
import { SERVER_EVENTS } from "@pingxy/shared/socket/events";
import { userSockets } from "./socket.state";
import { WebSocketData } from "./types";

export const socketHandler: WebSocketHandler<WebSocketData> = {
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
  [SERVER_EVENTS.RECEIPTS.ALL_READ]: async (ws, data) => {
    if (data.payload.conversationId && data.payload.userId) {
      await ReceiptService.processMarkAllRead(data);
    }
  },

  [SERVER_EVENTS.RECEIPTS.DELIVERED]: async (ws, messagePayload) => {
    await ReceiptService.processDeliveryReceipt(messagePayload);
  },

  [SERVER_EVENTS.RECEIPTS.READ]: async (ws, messagePayload) => {
    await ReceiptService.processReadReceipt(messagePayload);
  },

  "conversation.open": (ws, message) => {
    const conversationId = message.data?.conversationId;
    ws.data.activeConversations.add(conversationId!.toString());
    ws.subscribe(conversationId!.toString());
    console.log("subscribed");
  },

  subscribe: (ws, message) => {
    const conversationId = message.msgData?.message?.conversationId?.toString();
    ws.subscribe(conversationId!);
  },

  close_conversation: (ws, message) => {
    const conversationId = message.msgData?.message?.conversationId?.toString();
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
