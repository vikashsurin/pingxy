import { z } from "zod";

export const userSchema = z.object({
  uid: z.string(),
  roles: z
    .array(z.enum(["admin", "moderator", "user", "guest"]))
    .default(["user"]),
  username: z
    .string()
    .min(3, "Username must be 3 characters or more")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "Username must be alphanumeric"),
  gender: z.string(),
  age: z.number(),
  country: z.string(),
  bio: z.string().optional(),
});

export interface BanDetails {
  uid: string;
  reason: string;
  bannedBy: string;
  expiresAt: number | null; // null for permanent
  createdAt: number;
}

export const sessionSchema = z.object({
  sid: z.uuid(),
  uid: z.string(),
  lastActivity: z.number(),
  expiresAt: z.number(),
  ipAddress: z.union([z.ipv4(), z.ipv6()]).optional(),
  userAgent: z.string().optional(),
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
  content: z.string(),
  senderId: z.string().optional(),
  recipientId: z.string().optional(),
  senderName: z.string().optional(),
  roomId: z.string().optional(),
  timestamp: z.number(),
  read: z.number().optional(),
  // status: z.enum(["sent", "delivered", "read"]).default("sent"),
});

export const readReceiptSchema = z.object({
  type: z.literal("read_receipt"),
  messageId: z.string().optional(),
  senderId: z.string(),
  recipientId: z.string(),
});

export const typingEventSchema = z.object({
  type: z.literal("typing"),
  isTyping: z.boolean(),
  senderId: z.string(),
  recipientId: z.string().optional(),
});

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  isPrivate: z.boolean().default(false),
  createdBy: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

export type User = z.infer<typeof userSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type Message = z.infer<typeof messageSchema>;
export type ReadReceipt = z.infer<typeof readReceiptSchema>;
export type TypingEvent = z.infer<typeof typingEventSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Room = z.infer<typeof roomSchema>;

export type ChatTarget = User | Room;
