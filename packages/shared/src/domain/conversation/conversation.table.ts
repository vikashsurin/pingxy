import { sql } from "drizzle-orm";
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
    user1Id: t.integer(),
    user2Id: t.integer(),
    maxParticipants: t.integer(),
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
    t.check("user_order_check", sql`${table.user1Id} < ${table.user2Id}`),
    t.unique("unique_user_pair").on(table.user1Id, table.user2Id),

    t
      .foreignKey({
        name: "conversations_users_fk",
        columns: [table.user1Id],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

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
