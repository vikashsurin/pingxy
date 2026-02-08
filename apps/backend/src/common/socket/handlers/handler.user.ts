import { userSockets } from "../socket.state";
import type { User } from "@pingxy/shared/types";
import type { SocketEventMap } from "@pingxy/shared/socket/types";
import { SERVER_EVENTS } from "@pingxy/shared/constants/index";

export function broadcastOnlineUsers() {
  const users: User[] = [];

  console.log({ userss: userSockets });

  for (const [id, data] of userSockets.entries()) {
    users.push({ ...data.user });
  }
  const message: SocketEventMap["event:users.online"] = {
    id: crypto.randomUUID(),
    type: SERVER_EVENTS.USERS.ONLINE,
    payload: {
      users: users,
    },
  };

  for (const [id, data] of userSockets.entries()) {
    try {
      data.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}: `, error);
    }
  }
  console.log(`Broadcasted online users: ${users.length} users`);
}

export function broadcastUserOffline(userId: number, username: string) {
  userSockets.delete(userId);
  const message = {
    type: "user_offline",
    id: crypto.randomUUID(),
    // users: {
    //   id: userId,
    //   username: username,
    // }
  };

  for (const [id, data] of userSockets.entries()) {
    try {
      data.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}:`, error);
    }
  }
}
