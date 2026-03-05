import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { sessions } from "../session/session.table";
import { users } from "../user/user.table";

export const refreshTokens = table(
  "refresh_tokens",
  {
    tokenId: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    refreshToken: t.text().notNull(),
    userId: t.integer().notNull(),
    sessionId: t.integer().notNull(),
    createdAt: t.integer().default(sql`extract(epoch from now())`),
    updatedAt: t.integer().default(sql`extract(epoch from now())`),
    expiresAt: t.integer(),
  },
  (table) => [
    t
      .foreignKey({
        name: "refresh_tokens_user_fk",
        columns: [table.userId],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "refresh_tokens_session_fk",
        columns: [table.sessionId],
        foreignColumns: [sessions.sessionId],
      })
      .onDelete("cascade"),

    t.index("refresh_tokens_userIdIdx").on(table.userId),
    t
      .index("refresh_token_userId_sessionIdIdx")
      .on(table.userId, table.sessionId),
    t.index("refresh_token_expires_atIdx").on(table.expiresAt),
  ],
);
