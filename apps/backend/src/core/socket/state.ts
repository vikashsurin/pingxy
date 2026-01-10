import { PublicUser } from "@chat/shared/src/lib/utils/validation";
import { WebSocketData } from "./types";
export let announcedUsers: Set<string> = new Set();

export type UserSocketData = {
  socket: Bun.ServerWebSocket<WebSocketData>
  user: PublicUser
}
export let userSockets: Map<number, UserSocketData> = new Map();
