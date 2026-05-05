import { z } from "zod";

export const groupCreateSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  visibility: z.enum(["private", "public"]),
  description: z.string(),
  maxParticipants: z.number(),
});

export const inviteCreateSchema = z.object({
  expiresAt: z.date(),
  maxUses: z.number(),
});

export type GroupCreateForm = z.infer<typeof groupCreateSchema>;
