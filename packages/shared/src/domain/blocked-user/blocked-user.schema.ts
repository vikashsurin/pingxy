import { createInsertSchema } from "drizzle-zod";
import { blockedUsers } from "./blocked-user.table";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { SERVER_EVENTS } from "../../constants/socket-events";
export const blockedUserInsertSchema = createInsertSchema(blockedUsers).pick({
  blockerId: true,
  blockedId: true,
});
export const blockedUserSelectSchema = createSelectSchema(blockedUsers, {
  blockedAt: z.coerce.date(),
});

export const blockedUserInfoSchema = z.object({
  id: z.number(),
  username: z.string(),
  block: blockedUserSelectSchema.extend({ blockedAt: z.coerce.date() }),
});


export const userUnblockedSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.BLOCKS.UNBLOCKED),
  payload: blockedUserSelectSchema
})