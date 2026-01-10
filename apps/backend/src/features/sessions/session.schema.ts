import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "@core/db/schema";

export const sessions = table(
  "sessions",
  {
    session_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    hashed_token: t.text().notNull().unique(),
    user_id: t.integer().notNull(),
    ip_address: t.text().notNull(),
    user_agent: t.text(),
    refresh_token: t.text(),
    is_active: t.boolean().default(true),
    last_activity: t.integer().default(sql`extract(epoch from now())`),
    created_at: t.integer().default(sql`extract(epoch from now())`),
    updated_at: t.integer().default(sql`extract(epoch from now())`),
    expires_at: t.integer(),
  },
  (table) => [
    t
      .foreignKey({
        name: "user_fk",
        columns: [table.user_id],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t.index("sessions_user_id_idx").on(table.user_id),
    t.index("session_expires_at_idx").on(table.expires_at),
    t.index("sessions_ip_address_idx").on(table.ip_address),
    t
      .index("session_is_active_last_activity_idx")
      .on(table.is_active, table.last_activity),
  ]
);
