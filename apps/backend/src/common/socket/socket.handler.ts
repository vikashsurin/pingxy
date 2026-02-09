import { ReceiptService } from "@modules/receipts";
import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { WebSocketHandler } from "bun";
import { onSocketMessage } from "./dispatcher";
import { emitDisconnected, emitUserList } from "./handlers/handler.user";
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
    emitUserList();
  },

  async message(ws, message) {
    onSocketMessage(ws, message);
  },

  close(ws) {
    emitDisconnected(ws.data.user);
    console.log("closed connection");
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
