import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("userType", ["admin", "user"]);

export const users = table(
  "users",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    type: userTypeEnum().default("user").notNull(),
    userName: t.text().notNull().unique(),
    email: t.text().notNull().unique(),
    hashedPassword: t.text().notNull(),
    lastSeenAt: t.timestamp({ withTimezone: true }),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [t.uniqueIndex("users_usernameIdx").on(table.userName)],
);
