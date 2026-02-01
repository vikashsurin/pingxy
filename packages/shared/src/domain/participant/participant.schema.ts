import { createSelectSchema } from "drizzle-zod";
import { participants } from './participant.table'

export const participantSelectSchema = createSelectSchema(participants);
