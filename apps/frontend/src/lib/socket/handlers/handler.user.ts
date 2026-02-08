import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { SocketHandlers } from "@pingxy/shared/socket/types";
import * as userManager from "$lib/store/managers/user.svelte";

export const userHandler: SocketHandlers = {
  [SERVER_EVENTS.USERS.ONLINE]: (data) => {
    console.log("online users", data.payload.users);
    userManager.setOnlineUsers(data.payload.users);
  },
};
