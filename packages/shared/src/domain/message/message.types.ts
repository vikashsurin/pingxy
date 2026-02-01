import {
  messageInsertSchema,
} from "./message.schema";
import { z } from "zod";

export type SendMessageRequest = z.infer<typeof messageInsertSchema>;
