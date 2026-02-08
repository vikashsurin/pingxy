import { z } from "zod";
import {
  RegisterUserRequestSchema,
  GuestUserRequestSchema,
  UserInsertSchema,
  UserResponseSchema,
  usersOnlineSchema,
  insertUserSchema,
  selectUserSchema,
} from "./user.schema";
// import type { SERVER_EVENTS } from "socket";
import type { SERVER_EVENTS } from "../../constants/socket-events";
import type { SocketEventEnvelope } from "socket/base";

export type RegisterUser = z.infer<typeof RegisterUserRequestSchema>;
export type RegisterGuest = z.infer<typeof GuestUserRequestSchema>;
export type NewUser = z.infer<typeof UserInsertSchema>;
export type User = z.infer<typeof UserResponseSchema>;

export type InsertUserType = z.infer<typeof insertUserSchema>;
export type SelectUserType = z.infer<typeof selectUserSchema>;

// export type OnlineUserType = z.infer<typeof UserResponseSchema>;
// export type ServerUsersOnlineType = z.infer<typeof usersOnlineSchema>;

export interface UserEventMap {
  [SERVER_EVENTS.USERS.ONLINE]: SocketEventEnvelope<
    typeof SERVER_EVENTS.USERS.ONLINE,
    {
      users: User[];
    }
  >;
}
