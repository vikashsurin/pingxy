import { dispatchServerEvent } from "./dispatcher";

let socket: WebSocket | null = null;

const messageQueue: string[] = [];

function flushMessageQueue() {
  if (socket?.readyState === WebSocket.OPEN) {
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      if (message) {
        socket.send(message);
      }
    }
  }
}

export const initializeWebSocket = () => {
  socket = new WebSocket("ws://localhost/ws");

  socket.addEventListener("open", () => {
    console.log("[WebSocket]  connected");
    flushMessageQueue();
  });

  socket.addEventListener("message", (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    dispatchServerEvent(data);
  });

  socket.addEventListener("close", () => {
    console.log("[WebSocket] disconnected");
  });

  return socket;
};

export function getWebSocket() {
  if (!socket) {
    throw new Error("WebSocket not initialized");
  }

  return socket;
}

export function send(payload: object) {
  const message = JSON.stringify(payload);

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    messageQueue.push(message);
  }
}
