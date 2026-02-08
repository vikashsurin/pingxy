import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { participants } from "./participant.table";

export const participantInsertSchema = createInsertSchema(participants);
export const participantSelectSchema = createSelectSchema(participants);
