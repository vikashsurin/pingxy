import { z } from "zod";
import {
  clientNewMessageSchema,
  insertMessageSchema,
  selectMessageSchema,
  serverNewMessageSchema,
  updateMessageSchema
} from "./message.schema";

export type InsertMessageType = z.infer<typeof insertMessageSchema>;
export type UpdateMessageType = z.infer<typeof updateMessageSchema>;
export type selectMessageType = z.infer<typeof selectMessageSchema>;

export type SendMessageRequest = z.infer<typeof insertMessageSchema>;
export type Message = z.infer<typeof selectMessageSchema>;

export type ClientNewMessageType = z.infer<typeof clientNewMessageSchema>
export type ServerNewMessageType = z.infer<typeof serverNewMessageSchema>;
