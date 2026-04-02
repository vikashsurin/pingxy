import { DOMAIN_EVENTS, SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { User } from "@pingxy/shared/types";
import { createServerEvent } from "../socket.factory";

import redis from "@lib/redis";
import { connectionManager } from "../connectionManager";
import { SocketHandler } from "./index";

export const userHandler: SocketHandler = {
  [DOMAIN_EVENTS.USERS.LOGOUT]: async (socket, data) => {
    socket.unsubscribe(`inbox:${data.payload.user.id}`);
    socket.unsubscribe(":server");
  },
};

export const emitUserList = async () => {
  const users = await redis.smembers("online_users");

  const results = await Promise.all(
    users.map(async (u) => {
      const raw = await redis.hgetall(`user:${u}`);
      return {
        ...raw,
        id: Number(raw.id),
        age: Number(raw.age),
        email: raw.email || null,
        username: raw.username,
        country: raw.country,
        bio: raw.bio || null,
        lastSeenAt: raw.lastSeenAt ? new Date(raw.lastSeenAt) : null,
        type: raw.type as "admin" | "moderator" | "user" | "guest",
        gender: raw.gender as "male" | "female" | "other",
        isOnline: true,
      };
    }),
  );

  const message = createServerEvent(SERVER_EVENTS.USERS.LIST, {
    users: results,
  });
  const sockets = connectionManager.getSockets();

  for (const [id, socket] of sockets.entries()) {
    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}: `, error);
    }
  }
};

export const emitConnected = (user: User) => {
  const message = createServerEvent(SERVER_EVENTS.USERS.CONNECTED, {
    user: { ...user, isOnline: true },
  });
  const sockets = connectionManager.getSockets();
  for (const [id, socket] of sockets.entries()) {
    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}: `, error);
    }
  }
};

export const emitDisconnected = (user: User) => {
  const message = createServerEvent(SERVER_EVENTS.USERS.DISCONNECTED, {
    user: { ...user },
  });

  const sockets = connectionManager.getSockets();
  for (const [id, socket] of sockets.entries()) {
    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}: `, error);
    }
  }
};
