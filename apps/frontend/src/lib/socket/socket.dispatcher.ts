import { ServerEventSchema } from "@pingxy/shared/socket/schema";
import { handlers } from "./handlers/index";
import { z } from "zod";

export const handleGenericEvent = (rawData: unknown) => {
  try {
    const result = ServerEventSchema.safeParse(rawData);

    console.log({ result });

    if (!result.success) {
      console.error(
        "[Socket] Received invalid server event:",
        z.treeifyError(result.error),
      );
      return;
    }

    const handler = handlers[result.data.type];

    if (handler) {
      handler(result.data as any);
    } else {
      console.warn(`[Socket] No frontend handler for: ${result.data.type}`);
    }
  } catch (err) {
    console.error("[Socket] Critical error in event dispatcher:", err);
  }
};
