import { z } from "zod";
import {
  dbInsertMessageReceiptSchema,
  insertReceiptSchema,
  receiptEventSchema,
  receiptReqSchema,
  selectMessageReceiptSchema,
  selectReceiptSchema,
  wsReceiptPayload,
} from "./message-receipt.schema";
import type { SocketEventEnvelope } from "../../socket/base";
import type {
  DOMAIN_EVENTS,
  SERVER_EVENTS,
} from "../../constants/socket-events";

export type InsertReceiptType = z.infer<typeof insertReceiptSchema>;
export type SelectReceiptType = z.infer<typeof selectReceiptSchema>;

export type MessageReceipt = z.infer<typeof selectMessageReceiptSchema>;
export type ReceiptPayloadType = z.infer<typeof wsReceiptPayload>;

export type DBInsertMessageReceiptType = z.infer<
  typeof dbInsertMessageReceiptSchema
>;

export type ReceiptRequestType = z.infer<typeof receiptReqSchema>;
export type ReceiptEventType = z.infer<typeof receiptEventSchema>;

export interface ReceiptEventMap {
  [DOMAIN_EVENTS.RECEIPTS.SENT]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.RECEIPTS.SENT,
    {
      conversationId: number;
      messageId: number;
      userId: number;
      recipient: {
        id: number;
        name: string;
      };
    }
  >;
  [DOMAIN_EVENTS.RECEIPTS.DELIVER]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.RECEIPTS.DELIVER,
    {
      conversationId: number;
      messageId: number;
      userId: number;
      recipient: {
        id: number;
        name: string;
      };
    }
  >;
  [DOMAIN_EVENTS.RECEIPTS.READ]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.RECEIPTS.READ,
    {
      conversationId: number;
      messageId: number;
      userId: number;
      recipient: {
        id: number;
      };
    }
  >;
  [DOMAIN_EVENTS.RECEIPTS.ALL_DELIVER]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.RECEIPTS.ALL_DELIVER,
    {
      conversationId: number;
      messageId: number;
      userId: number;
    }
  >;
  [DOMAIN_EVENTS.RECEIPTS.ALL_READ]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.RECEIPTS.ALL_READ,
    {
      conversationId: number;
      messageId: number;
      userId: number;
      recipient: {
        id: number;
      };
    }
  >;
  [SERVER_EVENTS.RECEIPTS.SENT]: SocketEventEnvelope<
    typeof SERVER_EVENTS.RECEIPTS.SENT,
    {
      receipt: MessageReceipt;
      recipient: {
        id: number;
      };
    }
  >;
  [SERVER_EVENTS.RECEIPTS.DELIVERED]: SocketEventEnvelope<
    typeof SERVER_EVENTS.RECEIPTS.DELIVERED,
    {
      receipts: MessageReceipt[];
      recipient: {
        id: number;
      };
    }
  >;
  [SERVER_EVENTS.RECEIPTS.READ]: SocketEventEnvelope<
    typeof SERVER_EVENTS.RECEIPTS.READ,
    {
      receipts: MessageReceipt[];
      recipient: {
        id: number;
      };
    }
  >;
  [SERVER_EVENTS.RECEIPTS.ALL_DELIVERED]: SocketEventEnvelope<
    typeof SERVER_EVENTS.RECEIPTS.ALL_DELIVERED,
    {
      receipts: MessageReceipt[];
      recipient: {
        id: number;
      };
    }
  >;
  [SERVER_EVENTS.RECEIPTS.ALL_READ]: SocketEventEnvelope<
    typeof SERVER_EVENTS.RECEIPTS.ALL_READ,
    {
      receipts: MessageReceipt[];
      recipient: {
        id: number;
      };
    }
  >;
}
