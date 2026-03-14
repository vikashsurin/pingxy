import { ServerEventSchema } from "@pingxy/shared/socket/schema";
import { handlers } from "./handlers/index";
import { z } from "zod";

let counter = 0;
export const handleGenericEvent = (rawData: unknown) => {
  try {
    const result = ServerEventSchema.safeParse(rawData);
    // #Uncomment for Debugging
    // counter++
    // console.log({ zodValidation: result });
    // console.log(`[Socket] Event ${counter}`);

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
