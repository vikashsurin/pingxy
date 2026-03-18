import redis from "@common/redis";
import { ServerWebSocket } from "bun";
import { WebSocketData } from "./types";


function createConnectionManager() {
  const sockets = new Map<number, ServerWebSocket<WebSocketData>>();
  let serverInstance: Bun.Server<WebSocketData>;

  function setServer(server: Bun.Server<WebSocketData>) {
    serverInstance = server;
  }

  function getServer() {
    return serverInstance;
  }


  function getSockets() {
    return sockets;
  }

  async function connect(userId: number, socket: ServerWebSocket<WebSocketData>) {
    // Save socket to in-memory map
    sockets.set(userId, socket);

    // Add user to online users set
    await redis.sadd('online_users', userId.toString())

    // Add presence
    await redis.set(`presence:${userId}`, 'online')

  }

  async function disconnect(userId: number) {
    // Delete socket from in-memory map
    removeSocket(userId)

    // Remove from online users set
    await redis.srem('online_users', userId.toString())

    // Remove presence
    await redis.del(`presence:${userId}`)

  }


  async function publish(topic: string, data: string) {
    serverInstance?.publish(topic, data);
  }

  function removeSocket(userId: number) {
    const socket = sockets.get(userId);
    if (socket) {
      socket.close();
    }
    sockets.delete(userId);
  }

  return {
    setServer,
    getServer,
    getSockets,
    connect,
    disconnect,
    publish,
    removeSocket,
  };
}

export const connectionManager = createConnectionManager()
