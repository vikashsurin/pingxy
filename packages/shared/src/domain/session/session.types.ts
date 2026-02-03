import { insertSessionSchema, selectSessionSchema } from "types";
import { z } from "zod";

export type InsertSessionType = z.infer<typeof insertSessionSchema>;
export type SelectSessionType = z.infer<typeof selectSessionSchema>;
