import { z } from "zod";
import {
  clientMessageSchema,
  insertMessageSchema,
  selectMessageSchema,
  serverMessageSchema,
  updateMessageSchema,
} from "./message.schema";

export type InsertMessageType = z.infer<typeof insertMessageSchema>;
export type UpdateMessageType = z.infer<typeof updateMessageSchema>;
export type selectMessageType = z.infer<typeof selectMessageSchema>;

export type SendMessageRequest = z.infer<typeof insertMessageSchema>;
export type Message = z.infer<typeof selectMessageSchema>;

export type ClientMessageType = z.infer<typeof clientMessageSchema>;
export type ServerMessageType = z.infer<typeof serverMessageSchema>;
