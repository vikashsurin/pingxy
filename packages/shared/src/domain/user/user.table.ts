import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";

export const roleTypeEnum = pgEnum("role", [
  "admin",
  "moderator",
  "user",
  "guest",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const users = table(
  "users",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    role: roleTypeEnum().default("guest"),
    email: t.text().unique(),
    username: t.text().notNull().unique(),
    hashedPassword: t.text(),
    gender: genderEnum().notNull().default("other"),
    age: t.integer().notNull().default(18),
    country: t.text().notNull().default("AF"),
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
