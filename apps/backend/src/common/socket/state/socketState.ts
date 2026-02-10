import { User } from "@pingxy/shared/types";
import { WebSocketData } from "../types";
export let announcedUsers: Set<string> = new Set();

export type UserSocketData = {
  socket: Bun.ServerWebSocket<WebSocketData>;
  user: User;
};
export let userSockets: Map<number, UserSocketData> = new Map();
