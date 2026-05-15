import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "../user/user.table";

export const blockedUsers = table(
  "blocked_users",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    blockerId: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    t
      .uniqueIndex("blocked_users_blockerId_blockedIdIdx")
      .on(table.blockerId, table.blockedId),
    t.index("blocked_users_blockerIdIdx").on(table.blockerId),
    t.index("blocked_users_blockedIdIdx").on(table.blockedId),
  ],
);
