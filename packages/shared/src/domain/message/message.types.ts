import {
  messageInsertSchema,
  messageSelectSchema,
} from "./message.schema";
import { z } from "zod";

export type SendMessageRequest = z.infer<typeof messageInsertSchema>;
export type Message = z.infer<typeof messageSelectSchema>;
