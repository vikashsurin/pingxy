import { participantSelectSchema } from "types";
import { z } from "zod";

export type Participant = z.infer<typeof participantSelectSchema>;
