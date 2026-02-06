import type { SocketHandlers } from "@pingxy/shared";
import { messageHandler } from "./message";
import { receiptHandler } from "./receipt";
import { userHandler } from "./user";

export const handlers: SocketHandlers = {
  ...messageHandler,
  ...receiptHandler,
  ...userHandler,
};
