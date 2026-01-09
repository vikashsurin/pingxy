import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema, createSelectSchema } from "drizzle-zod";

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
    user_type: userTypesEnum("user_type").default("guest"),
    username: t.text().notNull().unique(),
    hashed_password: t.text(),
    data: t.jsonb().notNull(),
    last_seen_at: t.timestamp({ withTimezone: true }),
    created_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updated_at: t.timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [t.uniqueIndex("users_username_idx").on(table.username)]
);

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);
export const userUpdateSchema = createUpdateSchema(users);
