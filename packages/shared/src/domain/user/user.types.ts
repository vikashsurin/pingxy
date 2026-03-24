import { z } from "zod";
import {
  GuestUserRequestSchema,
  insertUserSchema,
  RegisterUserRequestSchema,
  selectUserSchema,
} from "./user.schema";


export type RegisterUser = z.infer<typeof RegisterUserRequestSchema>;
export type RegisterGuest = z.infer<typeof GuestUserRequestSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema> & {
  isOnline: boolean;
};

export type InsertUserType = z.infer<typeof insertUserSchema>;
export type SelectUserType = z.infer<typeof selectUserSchema>;

