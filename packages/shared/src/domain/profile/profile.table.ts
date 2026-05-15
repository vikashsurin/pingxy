import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import { users } from "../user/user.table";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const profiles = table("profiles", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t
    .integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  gender: genderEnum().notNull(),
  age: t.integer().notNull(),
  country: t.text().notNull(),
  bio: t.text(),
});
