import {
  participantInsertSchema,
  participantSelectSchema,
} from "./participant.schema";
import { z } from "zod";

export type Participant = z.infer<typeof participantSelectSchema>;
export type ParticipantInsertType = z.infer<typeof participantInsertSchema>;
