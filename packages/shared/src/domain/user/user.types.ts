import { z } from "zod";
import {
  RegisterUserRequestSchema,
  GuestUserRequestSchema,
  UserInsertSchema,
  UserResponseSchema,
} from "./user.schema";

export type RegisterUser = z.infer<typeof RegisterUserRequestSchema>;
export type RegisterGuest = z.infer<typeof GuestUserRequestSchema>;
export type NewUser = z.infer<typeof UserInsertSchema>;
export type PublicUser = z.infer<typeof UserResponseSchema>;
