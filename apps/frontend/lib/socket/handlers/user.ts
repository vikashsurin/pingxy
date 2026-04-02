import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import { SocketHandlerMap } from "../dispatcher";

export const userHandler: SocketHandlerMap = {
  [SERVER_EVENTS.USERS.LIST]: (data) => {
    console.log("Received user list", data.payload.users);
    // userManager.setOnlineUsers(data.payload.users);
  },
  [SERVER_EVENTS.USERS.CONNECTED]: (data) => {
    // userManager.addOnlineUser(data.payload.user);
  },
  [SERVER_EVENTS.USERS.DISCONNECTED]: (data) => {
    // userManager.removeOnlineUser(data.payload.user);
  },
  [SERVER_EVENTS.USERS.LOGIN]: (data) => {
    // userManager.addOnlineUser(data.payload.user);
  },
  [SERVER_EVENTS.USERS.LOGOUT]: (data) => {
    // userManager.removeOnlineUser(data.payload.user);
  },
};
