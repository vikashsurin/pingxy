import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import { SocketHandlerMap } from "../dispatcher";
import { userManager } from "@/lib/managers/userManager";

export const userHandler: SocketHandlerMap = {
  [SERVER_EVENTS.USERS.LIST]: (data) => {
    console.log("Received user list", data.payload.users);

    const users = data.payload.users;

    for (const user of users) {
      userManager.upsertOnlineUser(user);
    }
  },
  [SERVER_EVENTS.USERS.CONNECTED]: (data) => {},
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
