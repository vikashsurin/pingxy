import { z } from "zod";
import {
  RegisterUserRequestSchema,
  GuestUserRequestSchema,
  insertUserSchema,
  selectUserSchema,
} from "./user.schema";

import type { SERVER_EVENTS } from "../../constants/socket-events";
import type { SocketEventEnvelope } from "socket/base";

export type RegisterUser = z.infer<typeof RegisterUserRequestSchema>;
export type RegisterGuest = z.infer<typeof GuestUserRequestSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export type InsertUserType = z.infer<typeof insertUserSchema>;
export type SelectUserType = z.infer<typeof selectUserSchema>;

export interface UserEventMap {
  [SERVER_EVENTS.USERS.LIST]: SocketEventEnvelope<
    typeof SERVER_EVENTS.USERS.LIST,
    {
      users: User[];
    }
  >;
  [SERVER_EVENTS.USERS.CONNECTED]: SocketEventEnvelope<
    typeof SERVER_EVENTS.USERS.CONNECTED,
    {
      user: User;
    }
  >;
  [SERVER_EVENTS.USERS.DISCONNECTED]: SocketEventEnvelope<
    typeof SERVER_EVENTS.USERS.DISCONNECTED,
    {
      user: User;
    }
  >;
}
