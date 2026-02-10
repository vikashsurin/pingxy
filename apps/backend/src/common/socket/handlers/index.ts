import { ClientReq } from "@pingxy/shared/types";
import { type WebSocketData } from "../types";
import { conversationHandler } from "./socket.conversation";
import { messageHandler } from "./socket.message";
import { receiptHandler } from "./socket.receipt";
import { userHandler } from "./socket.user";

export type ClientReqMap = {
  [R in ClientReq as R["type"]]: R;
};

export type SocketHandler = {
  [K in keyof ClientReqMap]?: (
    socket: Bun.ServerWebSocket<WebSocketData>,
    data: ClientReqMap[K],
  ) => Promise<void> | void;
};

export const handlers: SocketHandler = {
  ...messageHandler,
  ...userHandler,
  ...receiptHandler,
  ...conversationHandler,
};
