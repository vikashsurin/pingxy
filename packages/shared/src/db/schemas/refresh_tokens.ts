import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { sessions } from './sessions'
import { users } from './users'

export const refresh_tokens = table(
  "refresh_tokens",
  {
    token_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    refresh_token: t.text().notNull(),
    user_id: t.integer().notNull(),
    session_id: t.integer().notNull(),
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

    t
      .foreignKey({
        name: "session_fk",
        columns: [table.session_id],
        foreignColumns: [sessions.session_id],
      })
      .onDelete("cascade"),

    t.index("refresh_tokens_user_id_idx").on(table.user_id),
    t
      .index("refresh_token_user_id_session_id_idx")
      .on(table.user_id, table.session_id),
    t.index("refresh_token_expires_at_idx").on(table.expires_at),
  ]
);
