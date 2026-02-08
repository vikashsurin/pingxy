import {
  participantInsertSchema,
  participantSelectSchema,
} from "./participant.schema";
import { z } from "zod";

export type Participant = z.infer<typeof participantSelectSchema>;
export type ParticipantInsert = z.infer<typeof participantInsertSchema>;
