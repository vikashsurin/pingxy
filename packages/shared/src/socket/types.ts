import { z } from "zod";
import { ServerEventSchema, ClientPayloadSchema } from "./wsMessage.schema";
import type { MessageEventMap, ReceiptEventMap } from "types";

export type SocketEventMap = MessageEventMap & ReceiptEventMap;

export type SocketHandlers = {
  [K in keyof SocketEventMap]?: (data: SocketEventMap[K]) => void;
};

export type ClientPayloadType = z.infer<typeof ClientPayloadSchema>;
export type ServerEventType = z.infer<typeof ServerEventSchema>;
