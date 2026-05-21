import { profiles } from "./profile.table";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";


export const profileCreateSchema = createInsertSchema(profiles);
export const profileUpdateSchema = createSelectSchema(profiles).pick({
  age: true,
  gender: true,
  country: true,
  bio: true
});
