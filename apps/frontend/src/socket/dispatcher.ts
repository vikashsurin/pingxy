import { ServerEventMap, type ServerEvent } from "@pingxy/shared";
import { ServerEventSchema } from "@pingxy/shared/socket/schema";
import { z } from "zod";
import {
  conversationHandler,
  messageHandler,
  userHandler,
} from "./handlers/index";

export type SocketHandlerMap = {
  [K in keyof ServerEventMap]?: (
    payload: ServerEventMap[K],
  ) => Promise<void> | void;
};

const registry: SocketHandlerMap = {
  ...userHandler,
  ...messageHandler,
  ...conversationHandler,
};

export const dispatchServerEvent = (rawData: unknown) => {
  try {
    console.log({ rawData });

    const parsed = ServerEventSchema.safeParse(rawData);

    if (!parsed.success) {
      console.error(
        "[Socket] event parse error",
        z.prettifyError(parsed.error),
      );
      throw new Error("Invalid event data", { cause: parsed.error });
    }

    const event = parsed.data;
    const handler = registry[event.type];

    if (handler) {
      (handler as (e: ServerEvent) => void)(event);
    } else {
      console.warn(
        "[Socket] No handler for socket event type",
        parsed.data.type,
      );
    }
  } catch (e) {
    console.error("[Socket] Unexpected error while handling server event", e);
  }
};
