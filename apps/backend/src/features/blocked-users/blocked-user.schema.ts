import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "../users/user.schema";

export const blocked_users = table(
  "blocked_users",
  {
    block_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    blocker_id: t.integer().notNull(),
    blocked_id: t.integer().notNull(),
    blocked_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    t
      .foreignKey({
        name: "blocker_fk",
        columns: [table.blocker_id],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "blocked_fk",
        columns: [table.blocked_id],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .uniqueIndex("blocked_users_blocker_id_blocked_id_idx")
      .on(table.blocker_id, table.blocked_id),

    t.index("blocked_users_blocker_id_idx").on(table.blocker_id),
    t.index("blocked_users_blocked_id_idx").on(table.blocked_id),
  ]
);
