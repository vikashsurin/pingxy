import { z } from "zod";
import { ServerEventSchema, ClientPayloadSchema } from './wsMessage.schema'
import { ClientRequestSchema } from "./wsPayload.schema";

// export type ClientPayloadType = z.infer<typeof ClientPayloadSchema>;
export type ClientPayloadType = z.infer<typeof ClientRequestSchema>;
export type ServerEventType = z.infer<typeof ServerEventSchema>;
