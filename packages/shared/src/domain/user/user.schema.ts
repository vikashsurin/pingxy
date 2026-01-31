import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../../constants/user";
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
    .min(MIN_NAME_LENGTH, "Username must be at least 3 characters")
    .max(MAX_NAME_LENGTH, "Username must be at most 16 characters"),
  data: UserMetaDataSchema,
});

export const RegisterUserRequestSchema = BaseUserSchema.extend({
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters")
    .max(MAX_PASSWORD_LENGTH, "Password must be at most 32 characters"),
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
