import { z } from "zod";
import {
  InsertMessageSchema,
  selectMessageSchema,
  updateMessageSchema,
  messageCreateSchema,
  messageCreatedSchema,
  dbMessageInsertSchema,
} from "./message.schema";
import type { SocketEventEnvelope } from "../../socket/base";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/socket-events";

export type InsertMessageType = z.infer<typeof InsertMessageSchema>;
export type UpdateMessageType = z.infer<typeof updateMessageSchema>;
export type selectMessageType = z.infer<typeof selectMessageSchema>;


export type DbInsertMessageType = z.infer<typeof dbMessageInsertSchema>;
export type SendMessageRequest = z.infer<typeof InsertMessageSchema>;
export type Message = z.infer<typeof selectMessageSchema>;

export type MessageCreateType = z.infer<typeof InsertMessageSchema>;
export type MessageCreatedType = z.infer<typeof messageCreatedSchema>;

export interface MessageEventMap {
  [DOMAIN_EVENTS.MESSAGES.CREATE]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.MESSAGES.CREATE,
    {
      message: MessageCreateType;
      conversationId: number | null;
      recipient: {
        id: number;
        userName: string;
      };
    }
  >;

  [DOMAIN_EVENTS.MESSAGES.SENT]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.MESSAGES.SENT,
    {
      message: Message;
      conversationId: number;
      recipient: {
        id: number;
        userName: string;
      };
    }
  >;
  [DOMAIN_EVENTS.MESSAGES.UPDATE]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.MESSAGES.UPDATE,
    {
      message: Message;
      conversationId: number;
      recipient: {
        id: number;
        userName: string;
      };
    }
  >;
  [DOMAIN_EVENTS.MESSAGES.DELETE]: SocketEventEnvelope<
    typeof DOMAIN_EVENTS.MESSAGES.DELETE,
    {
      message: Message;
      conversationId: number;
      recipient: {
        id: number;
        userName: string;
      };
    }
  >;

  [SERVER_EVENTS.MESSAGES.CREATED]: SocketEventEnvelope<
    typeof SERVER_EVENTS.MESSAGES.CREATED,
    {
      message: Message;
      conversationId: number;
      recipient: {
        id: number;
        userName: string;
      };
    }
  >;

  [SERVER_EVENTS.MESSAGES.SENT]: SocketEventEnvelope<
    typeof SERVER_EVENTS.MESSAGES.SENT,
    {
      message: Message;
      conversationId: number;
      recipient: {
        id: number;
        userName: string;
      };
    }
  >;

  [SERVER_EVENTS.MESSAGES.UPDATED]: SocketEventEnvelope<
    typeof SERVER_EVENTS.MESSAGES.UPDATED,
    {
      message: Message;
      conversationId: number;
      recipient: {
        id: number;
        userName: string;
      };
    }
  >;

  [SERVER_EVENTS.MESSAGES.DELETED]: SocketEventEnvelope<
    typeof SERVER_EVENTS.MESSAGES.DELETED,
    {
      message: Message;
      conversationId: number;
      recipient: {
        id: number;
        userName: string;
      };
    }
  >;
}
