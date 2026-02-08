import { sessionInsertSchema, sessionSelectSchema } from "./session.schema";
import { z } from "zod";

export type NewSession = z.infer<typeof sessionInsertSchema>;
export type Session = z.infer<typeof sessionSelectSchema>;
