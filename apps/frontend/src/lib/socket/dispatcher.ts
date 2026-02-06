import { handlers } from "./handlers";
import { ServerEventSchema } from "@pingxy/shared";

export const handleGenericEvent = (rawData: unknown) => {
  const result = ServerEventSchema.safeParse(rawData);
  if (!result.success) return;

  const handler = (handlers as any)[result.data.type];
  if (handler) handler(result.data);
};
