import { ClientReq } from "@pingxy/shared/types";
import { type WebSocketData } from "../types";
import { conversationHandler } from "./handler.conversation";
import { messageHandler } from "./handler.message";
import { receiptHandler } from "./handler.receipt";
import { userHandler } from "./handler.user";

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
