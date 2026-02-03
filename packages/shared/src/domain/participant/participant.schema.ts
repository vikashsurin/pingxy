import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { participants } from './participant.table';

export const insertParticipantSchema = createInsertSchema(participants);
export const selectParticipantSchema = createSelectSchema(participants);
