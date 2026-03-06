import { getSocket } from "$lib/socket/socket.svelte";

export function validateSocket() {
  const socket = getSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not ready");
    return null;
  }
  return socket;
}
