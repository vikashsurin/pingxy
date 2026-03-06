import { chatStore } from "$lib/stores/store.svelte";
import { handleGenericEvent } from "./socket.dispatcher";
import { getWebSocketUrl } from "./socket.helpers";

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
    handleGenericEvent(data);
  });

  socket.addEventListener("close", (event) => {
    console.log("disconnected");
    chatStore.isConnected = false;
  });
}

export function getSocket() {
  return socket;
}
