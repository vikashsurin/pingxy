import { ClientReqSchema } from "@pingxy/shared/socket";
import { z } from "zod";
import { handlers } from "./handlers";
import { sendError } from "./helpers/socketHelper";
import { WebSocketData } from "./types";

export const onSocketMessage = (
  socket: Bun.ServerWebSocket<WebSocketData>,
  rawData: string | Buffer<ArrayBuffer>,
) => {
  try {
    const parsedData = JSON.parse(rawData.toString());

    console.log("parsedData", parsedData)
    const result = ClientReqSchema.safeParse(parsedData);

    if (!result.success) {
      console.error("Invalid socket payload:", z.treeifyError(result.error));
      return sendError(socket, "Invalid payload", result.error._zod.def);
    }

    const handler = handlers[result.data.type];

    if (handler) {
      (handler as Function)(socket, result.data);
    } else {
      console.warn(`No handler found for event type: ${result.data.type}`);
    }
  } catch (error) {
    console.error("Failed to process socket message:", error);
  }
};
