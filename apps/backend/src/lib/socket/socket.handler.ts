import { UserService } from "@modules/users";
import type { WebSocketHandler } from "bun";
import { connectionManager } from "./connectionManager";
import { onSocketMessage } from "./dispatcher";
import { emitDisconnected, emitUserList } from "./handlers/socket.user";
import { WebSocketData } from "./types";

export const socketHandler: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  async open(ws) {
    const user = ws.data.user;
    console.info(`${user.username} joined`);

    await connectionManager.connect(user.id, ws);
    ws.subscribe(`inbox:${user.id}`);
    ws.subscribe(":server");
    emitUserList();

    ws.subscriptions.forEach((topic) => {
      console.log(`subscribed to ${topic}`);
    });
    console.log("opened connection");
  },

  async message(ws, message) {
    onSocketMessage(ws, message);
  },

  async close(ws) {
    console.log("closed connection");
    await connectionManager.disconnect(ws.data.user.id);

    emitDisconnected(ws.data.user);

    await UserService.updateLastSeen(ws.data.user.id);

    console.warn("closed connection");
  },
};
