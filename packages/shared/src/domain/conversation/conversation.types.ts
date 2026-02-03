import { selectConversationSchema, insertConversationSchema } from './conversation.schema'
import { z } from "zod";

export type Conversation = z.infer<typeof selectConversationSchema>;
export type InsertConversationType = z.infer<typeof insertConversationSchema>;
