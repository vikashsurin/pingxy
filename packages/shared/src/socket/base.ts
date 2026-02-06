export interface SocketEventEnvelope<TType extends string, TPayload> {
  id: string;
  type: TType;
  payload: TPayload;
}
