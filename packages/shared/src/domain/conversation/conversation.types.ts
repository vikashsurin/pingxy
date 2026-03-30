import { z } from "zod";
import {
    insertConversationSchema,
    selectConversationSchema,
} from "./conversation.schema";

export type Conversation = z.infer<typeof selectConversationSchema>;
export type InsertConversationType = z.infer<typeof insertConversationSchema>;

// export type ClientOpenConversationType = z.infer<typeof openConversationSchema>;

// export interface ConversationEventMap {
//     [DOMAIN_EVENTS.CONVERSATIONS.OPEN]: SocketEventEnvelope<
//         typeof DOMAIN_EVENTS.CONVERSATIONS.OPEN,
//         {
//             conversationId: number,
//             userId: number,
//         }
//     >;
// }
