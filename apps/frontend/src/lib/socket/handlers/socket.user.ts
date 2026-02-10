import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import * as userManager from "../../store/managers/entities/user.svelte";
import type { SocketHandler } from "./index";

export const userHandler: SocketHandler = {
  [SERVER_EVENTS.USERS.LIST]: (data) => {
    userManager.setOnlineUsers(data.payload.users);
  },
  [SERVER_EVENTS.USERS.CONNECTED]: (data) => {
    userManager.addOnlineUser(data.payload.user);
  },
  [SERVER_EVENTS.USERS.DISCONNECTED]: (data) => {
    // userManager.removeOnlineUser(data.payload.user);
  },
  [SERVER_EVENTS.USERS.LOGIN]: (data) => {
    userManager.addOnlineUser(data.payload.user);
  },
  [SERVER_EVENTS.USERS.LOGOUT]: (data) => {
    userManager.removeOnlineUser(data.payload.user);
  },
};
