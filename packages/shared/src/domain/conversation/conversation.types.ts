import { z } from "zod";
import { insertConversationSchema, openConversationSchema, selectConversationSchema } from './conversation.schema';
import type { DOMAIN_EVENTS } from "../../constants/index";
import type { SocketEventEnvelope } from "../../socket/base";

export type Conversation = z.infer<typeof selectConversationSchema>;
export type InsertConversationType = z.infer<typeof insertConversationSchema>;

export type ClientOpenConversationType = z.infer<typeof openConversationSchema>;


export interface ConversationEventMap {
    [DOMAIN_EVENTS.CONVERSATIONS.OPEN]: SocketEventEnvelope<
        typeof DOMAIN_EVENTS.CONVERSATIONS.OPEN,
        {
            conversationId: number,
            userId: number,
        }
    >;
}