// import { User } from "@pingxy/shared/types";
// import { WebSocketData } from "./types";
// import redis from "@lib/redis";

// let sockets: Map<string, Bun.ServerWebSocket<WebSocketData>> = new Map();
// let serverInstance: Bun.Server<WebSocketData>;

// export function setServer(server: Bun.Server<WebSocketData>) {
//   serverInstance = server;
// }

// export function getServer() {
//   return serverInstance;
// }

// export functionconnectionManager.publish(topic: string, data: string) {
//   if (serverInstance) {
//     serverInstance.publish(topic, data);
//   }
// }


// export function getSocket(id: string) {
//   return sockets.get(id);
// }

// export function setSocket(id: string, socket: Bun.ServerWebSocket<WebSocketData>) {
//   sockets.set(id, socket);
// }

// export function removeSocket(id: string) {
//   sockets.delete(id);
// }

// export async function connect(user: User, socket: Bun.ServerWebSocket<WebSocketData>) {
//   const id = Bun.randomUUIDv7();

//   setSocket(id, socket);
//   await redis.sadd(`user:${user.id}:sockets`, id);
//   await redis.sadd(`online_users`, `${user.id}`);
//   await redis.set(`presence:${user.id}`, 'online')

// }

// export async function disconnect(user: User) {
//   console.log("called disconnect")
//   await redis.del(`user:${user.id}:sockets`)
//   await redis.srem(`online_users`, `${user.id}`);
//   await redis.set(`presence:${user.id}`, 'offline');
//   await redis.expire(`presence:${user.id}`, 60);

// }
