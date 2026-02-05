import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";

export const userTypesEnum = pgEnum("user_type", [
  "admin",
  "moderator",
  "user",
  "guest",
]);

export const users = table(
  "users",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    userType: userTypesEnum("user_type").default("guest"),
    username: t.text().notNull().unique(),
    hashedPassword: t.text(),
    data: t.jsonb().notNull(),
    lastSeenAt: t.timestamp({ withTimezone: true }),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [t.uniqueIndex("users_usernameIdx").on(table.username)],
);
