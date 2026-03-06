import type { ClientReqType, ClientReqMap } from "@pingxy/shared/socket/types";

export function createClientReq<T extends ClientReqType>(
  type: T,
  payload: ClientReqMap[T]["payload"],
): ClientReqMap[T] {
  return {
    id: crypto.randomUUID(),
    type,
    payload,
  } as ClientReqMap[T];
}
