import type { ServerEventMap } from "@pingxy/shared/socket/types";
import { messageHandler } from "./socket.message";
import { receiptHandler } from "./socket.receipt";
import { userHandler } from "./socket.user";
import { errorHandler } from "./socket.error";

export type SocketHandler = {
  [K in keyof ServerEventMap]?: (
    payload: ServerEventMap[K],
  ) => Promise<void> | void;
};

export const handlers: SocketHandler = {
  ...errorHandler,
  ...messageHandler,
  ...receiptHandler,
  ...userHandler,
};
