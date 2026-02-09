import type { ServerEventMap } from "@pingxy/shared/socket/types";
import { messageHandler } from "./handler.message";
import { receiptHandler } from "./handler.receipt";
import { userHandler } from "./handler.user";
import { errorHandler } from "./handler.error";

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
