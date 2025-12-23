import { z } from "zod";

export const userSchema = z.object({
  uid: z.string(),
  username: z.string(),
  gender: z.string(),
  age: z.number(),
  country: z.string(),
});

export const connectionSchema = z.object({
  type: z.literal("connection"),
  status: z.enum(["join", "leave", "reconnect"]),
  text: z.string().optional(),
  user: userSchema,
});

export const messageSchema = z.object({
  id: z.string(),
  type: z.literal("message"),
  kind: z.enum(["chat", "system"]),
  text: z.string(),
  senderId: z.string().optional(),
  recipientId: z.string().optional(),
  senderName: z.string().optional(),
  timestamp: z.number(),
});

export type Message = z.infer<typeof messageSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type User = z.infer<typeof userSchema>;
