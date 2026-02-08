import {
  blockedUserInsertSchema,
  blockedUserSelectSchema,
} from "./blocked-user.schema";
import { z } from "zod";

export type BlockedUser = z.infer<typeof blockedUserSelectSchema>;
export type BlockedUserInsert = z.infer<typeof blockedUserInsertSchema>;
