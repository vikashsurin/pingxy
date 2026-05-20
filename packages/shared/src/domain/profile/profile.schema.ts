import { profiles } from "./profile.table";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";


export const profileCreateSchema = createInsertSchema(profiles);
