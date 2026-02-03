import { insertParticipantSchema, selectParticipantSchema } from "types";
import { z } from "zod";

export type Participant = z.infer<typeof selectParticipantSchema>;
export type InsertParticipantType = z.infer<typeof insertParticipantSchema>;
