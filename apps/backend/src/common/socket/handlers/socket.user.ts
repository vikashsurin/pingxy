import { DOMAIN_EVENTS, SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { User } from "@pingxy/shared/types";
import { createServerEvent } from "../socket.factory";
import { userSockets } from "../state/socketState";

import { SocketHandler } from "./index";

export const userHandler: SocketHandler = {
  [DOMAIN_EVENTS.USERS.LOGOUT]: async (socket, data) => {
    socket.unsubscribe(`inbox:${data.payload.user.id}`);
    socket.unsubscribe(":server");
  },
};

export const emitUserList = () => {
  const users: User[] = [];

  for (const [id, data] of userSockets.entries()) {
    users.push({ ...data.user });
  }

  const message = createServerEvent(SERVER_EVENTS.USERS.LIST, {
    users: users,
  });

  for (const [id, data] of userSockets.entries()) {
    try {
      data.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}: `, error);
    }
  }
};

export const emitConnected = (user: User) => {
  const message = createServerEvent(SERVER_EVENTS.USERS.CONNECTED, {
    user: user,
  });

  for (const [id, data] of userSockets.entries()) {
    try {
      data.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}: `, error);
    }
  }
};

export const emitDisconnected = (user: User) => {
  const message = createServerEvent(SERVER_EVENTS.USERS.DISCONNECTED, {
    user: user,
  });

  for (const [id, data] of userSockets.entries()) {
    try {
      data.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}: `, error);
    }
  }
};
