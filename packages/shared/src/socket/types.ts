import { z } from "zod";
import type { ClientReqSchema, ServerEventSchema } from "./schema";

// export type SocketEventMap = MessageEventMap &
//   ReceiptEventMap &
//   UserEventMap &
//   ConversationEventMap;

export type ClientReq = z.infer<typeof ClientReqSchema>;
export type ServerEvent = z.infer<typeof ServerEventSchema>;
export type ClientReqMap = {
  [E in ClientReq as E["type"]]: E;
};

export type ClientReqType = ClientReq["type"];
export type ServerEventType = ServerEvent["type"];
export type ServerEventMap = {
  [E in ServerEvent as E["type"]]: E;
};

