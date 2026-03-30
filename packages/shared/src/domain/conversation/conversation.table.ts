import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "../user/user.table";

export const conversationTypesEnum = t.pgEnum("conversationType", [
  "direct",
  "group",
]);

export const conversations = table(
  "conversations",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    type: conversationTypesEnum().default("direct").notNull(),
    name: t.varchar("name", { length: 100 }),
    description: t.text(),
    isPrivate: t.boolean().default(true).notNull(),
    lastMessageId: t.integer(),
    lastMessageAt: t.timestamp({ withTimezone: true }),
    isDeleted: t.boolean().default(false).notNull(),
    createdBy: t.integer(),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    t
      .foreignKey({
        name: "conversations_created_by_fk",
        columns: [table.createdBy],
        foreignColumns: [users.id],
      })
      .onDelete("cascade")
      .onUpdate("cascade"),

    t.index("conversations_created_byIdx").on(table.createdBy),
    t.index("conversations_last_message_atIdx").on(table.lastMessageAt),
  ],
);
