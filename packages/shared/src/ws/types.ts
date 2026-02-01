import { z } from "zod";
import { ServerEventSchema, ClientPayloadSchema } from "@pingxy/shared/ws";

export type ClientPayloadType = z.infer<typeof ClientPayloadSchema>;
export type ServerEventType = z.infer<typeof ServerEventSchema>;
