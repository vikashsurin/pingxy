import { chatStore } from "$lib/store/store.svelte";
import { messageHandler } from "./ws.handler.svelte";
import { getWebSocketUrl } from "./ws.helpers";

export let socket: WebSocket | null = null;

export function initSocket() {
  if (socket?.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(getWebSocketUrl());

  socket.addEventListener("open", (event) => {
    console.log("connected");
    chatStore.isConnected = true;
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    // const parsedData = ServerEventSchema.safeParse(rawData);
    // if (!parsedData.success) {
    //   console.error("Invalid message format", parsedData.error);
    //   return;
    // }
    // const data = parsedData.data;

    const handler = messageHandler[data.type];
    if (handler) {
      handler(data);
    }
  });

  socket.addEventListener("close", (event) => {
    console.log("disconnected");
    chatStore.isConnected = false;
  });
}

export function getSocket() {
  return socket;
}
