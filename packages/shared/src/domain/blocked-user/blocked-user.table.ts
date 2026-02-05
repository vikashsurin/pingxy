import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "../user/user.table";

export const blockedUsers = table(
  "blocked_users",
  {
    blockId: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    blockerId: t.integer().notNull(),
    blockedId: t.integer().notNull(),
    blockedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    t
      .foreignKey({
        name: "blocker_fk",
        columns: [table.blockerId],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "blocked_fk",
        columns: [table.blockedId],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .uniqueIndex("blocked_users_blockerId_blockedIdIdx")
      .on(table.blockerId, table.blockedId),

    t.index("blocked_users_blockerIdIdx").on(table.blockerId),
    t.index("blocked_users_blockedIdIdx").on(table.blockedId),
  ],
);
