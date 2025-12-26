import { z } from "zod";

export const userSchema = z.object({
  uid: z.string(),
  username: z
    .string()
    .min(3, "Username must be 3 characters or more")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "Username must be alphanumeric"),
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

export type User = z.infer<typeof userSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type Message = z.infer<typeof messageSchema>;
