import { z } from "zod";
import { clientOpenConversationSchema, insertConversationSchema, selectConversationSchema } from './conversation.schema';

export type Conversation = z.infer<typeof selectConversationSchema>;
export type InsertConversationType = z.infer<typeof insertConversationSchema>;

export type ClientOpenConversationType = z.infer<typeof clientOpenConversationSchema>;
