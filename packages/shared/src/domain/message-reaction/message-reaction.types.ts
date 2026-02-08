import {
  messageReactionInsertSchema,
  messageReactionSelectSchema,
} from "./message-reaction.schema";
import { z } from "zod";

export type MessageReaction = z.infer<typeof messageReactionSelectSchema>;
export type MessageReactionInsert = z.infer<typeof messageReactionInsertSchema>;
