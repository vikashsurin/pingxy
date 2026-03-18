import { chatStore } from "$lib/stores/store.svelte";
import { handleGenericEvent } from "./socket.dispatcher";
import { getWebSocketUrl } from "./socket.helpers";

export let socket: WebSocket | null = null;

const messageQueue: string[] = [];

function flushQueue() {
  while (messageQueue.length > 0) {
    const msg = messageQueue.shift()!;
    socket?.send(msg);
  }
}

export function send(payload: object) {
  const message = JSON.stringify(payload);

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    messageQueue.push(message);
  }
}

export function initSocket() {
  if (socket?.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(getWebSocketUrl());

  socket.addEventListener("open", (event) => {
    console.log("connected");
    chatStore.isConnected = true;
    flushQueue();
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
