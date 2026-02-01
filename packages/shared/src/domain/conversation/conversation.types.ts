import { selectConversationSchema } from './conversation.schema'
import { z } from "zod";

export type Conversation = z.infer<typeof selectConversationSchema>;
