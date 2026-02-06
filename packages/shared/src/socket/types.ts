import { z } from "zod";
import type { MessageEventMap, ReceiptEventMap } from "../domain";
import type { ClientReqSchema, ServerEventSchema } from "./schema";

export type SocketEventMap = MessageEventMap & ReceiptEventMap;

export type SocketHandlers = {
  [K in keyof SocketEventMap]?: (data: SocketEventMap[K]) => void;
};

export type ClientReqType = z.infer<typeof ClientReqSchema>;
export type ServerEventType = z.infer<typeof ServerEventSchema>;
