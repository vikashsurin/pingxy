import { handlers } from "./handlers";
import { ServerEventSchema } from "@pingxy/shared/socket/schema";

export const handleGenericEvent = (rawData: unknown) => {
  // Todo: Can wrap in try catch
  const result = ServerEventSchema.safeParse(rawData);
  if (!result.success) return;

  const handler = (handlers as any)[result.data.type];
  if (handler) handler(result.data);
};
