import { messageInsertSchema, wsMessageEnvelope } from "./message.schema";
import { z } from "zod";

export type SendMessageRequest = z.infer<typeof messageInsertSchema>;


export type WSMessageEnvelope = z.infer<typeof wsMessageEnvelope>
