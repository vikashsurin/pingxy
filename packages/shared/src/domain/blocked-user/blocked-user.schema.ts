import { createInsertSchema } from "drizzle-zod";
import { blockedUsers } from "./blocked-user.table";
import { createSelectSchema } from "drizzle-zod";

export const blockedUserInsertSchema = createInsertSchema(blockedUsers);
export const blockedUserSelectSchema = createSelectSchema(blockedUsers);
