import type { WebSocketHandler } from "bun";
import { onSocketMessage } from "./dispatcher";
import { emitDisconnected, emitUserList } from "./handlers/socket.user";
import { userSockets } from "./state/socketState";
import { WebSocketData } from "./types";

export const socketHandler: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {
    const user = ws.data.user;
    console.info(`${user.username} joined`);

    // save the userSocket
    userSockets.set(user.id, {
      socket: ws,
      user: user,
    });
    ws.subscribe(`inbox:${user.id}`);
    ws.subscribe(":server");
    emitUserList();
  },

  async message(ws, message) {
    onSocketMessage(ws, message);
  },

  close(ws) {
    emitDisconnected(ws.data.user);
    console.warn("closed connection");
  },
};


// update every 30 seconds
// setInterval(() => {
//   broadcastOnlineUsers();
// }, 30000);
