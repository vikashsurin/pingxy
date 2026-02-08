import { getSocket } from "$lib/socket/socket.svelte";

export const conn = {
  checkSocketConnection(message?: string) {
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn(message || "websocket not ready");
      return { warn: () => this, error: () => this }; // Chainable dummy
    }
    return {
      warn: (msg: string) => {
        console.warn(msg);
        return this;
      },
      error: (msg: string) => {
        console.error(msg);
        return this;
      },
    };
  },
};
