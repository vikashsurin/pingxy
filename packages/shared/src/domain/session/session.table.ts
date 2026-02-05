import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "../user/user.table";

export const sessions = table(
  "sessions",
  {
    sessionId: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    hashedToken: t.text().notNull().unique(),
    userId: t.integer().notNull(),
    ipAddress: t.text().notNull(),
    userAgent: t.text(),
    refreshToken: t.text(),
    isActive: t.boolean().default(true),
    lastActivity: t.integer().default(sql`extract(epoch from now())`),
    createdAt: t.integer().default(sql`extract(epoch from now())`),
    updatedAt: t.integer().default(sql`extract(epoch from now())`),
    expiresAt: t.integer(),
  },
  (table) => [
    t
      .foreignKey({
        name: "user_fk",
        columns: [table.userId],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t.index("sessions_userIdIdx").on(table.userId),
    t.index("session_expires_atIdx").on(table.expiresAt),
    t.index("sessions_ipAddressIdx").on(table.ipAddress),
    t
      .index("session_is_active_lastActivityIdx")
      .on(table.isActive, table.lastActivity),
  ],
);
