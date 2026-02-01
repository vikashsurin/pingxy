import { z } from "zod";
import { ServerEventSchema, ClientPayloadSchema } from './wsMessage.schema'

export type ClientPayloadType = z.infer<typeof ClientPayloadSchema>;
export type ServerEventType = z.infer<typeof ServerEventSchema>;
