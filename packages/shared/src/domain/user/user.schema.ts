import { z } from "zod";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { users } from "./user.table";

const UserMetaDataSchema = z.object({
  gender: z.string(),
  age: z.number().min(18, "Age must be a positive number"),
  country: z.string(),
  roles: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

const BaseUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters"),
  data: UserMetaDataSchema,
});

export const RegisterUserRequestSchema = BaseUserSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const GuestUserRequestSchema = BaseUserSchema;

export const UserInsertSchema = createInsertSchema(users);
export const UserResponseSchema = createSelectSchema(users).omit({
  hashed_password: true,
});

export const UserUpdateSchema = createUpdateSchema(users);
