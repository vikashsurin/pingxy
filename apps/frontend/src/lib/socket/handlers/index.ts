import type { SocketHandlers } from "@pingxy/shared/socket/types";
import { messageHandler } from "./handler.message";
import { receiptHandler } from "./handler.receipt";
import { userHandler } from "./handler.user";

export const handlers: SocketHandlers = {
  ...messageHandler,
  ...receiptHandler,
  ...userHandler,
};
