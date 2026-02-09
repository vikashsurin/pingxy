import { getSocket } from "$lib/socket/socket.svelte";
import type { ClientReqType, ClientReqMap } from "@pingxy/shared/socket/types";

export function validateSocket() {
  const socket = getSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not ready");
    return null;
  }
  return socket;
}
