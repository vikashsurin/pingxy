import { SERVER_EVENTS, ServerEvent } from "@pingxy/shared/socket";

export const sendError = (
  socket: Bun.ServerWebSocket<any>,
  message: string,
  issues?: any,
) => {
  const errorEvent: ServerEvent = {
    id: crypto.randomUUID(),
    type: SERVER_EVENTS.ERRORS.SYSTEM,
    payload: { message, issues },
  };

  socket.send(JSON.stringify(errorEvent));
};
