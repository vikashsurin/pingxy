import { WebSocketData } from "./socket/socketHandlers";

let serverInstance: Bun.Server<WebSocketData>

export function setServer(server: Bun.Server<WebSocketData>) {
  serverInstance = server
}


export function publish(topic: string, data: string) {
  if (serverInstance) {
    serverInstance.publish(topic, data)
  }
}


export function getServer() {
  return serverInstance;
}
