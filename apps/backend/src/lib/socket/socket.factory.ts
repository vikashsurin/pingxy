import { ServerEventMap, ServerEventType } from "@pingxy/shared/types";

export function createServerEvent<T extends ServerEventType>(
  type: T,
  payload: ServerEventMap[T]["payload"],
): ServerEventMap[T] {
  return {
    id: crypto.randomUUID(),
    type,
    payload,
  } as ServerEventMap[T];
}
