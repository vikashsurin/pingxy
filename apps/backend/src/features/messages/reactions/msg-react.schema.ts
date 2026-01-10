import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users, messages } from "@core/db/schema";

export const message_reactions = table(
  "message_reactions",
  {
    reaction_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    message_id: t.integer().notNull(),
    user_id: t.integer().notNull(),
    emoji: t.varchar("emoji", { length: 10 }).notNull(),
    created_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    t
      .foreignKey({
        name: "message_fk",
        columns: [table.message_id],
        foreignColumns: [messages.message_id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "user_fk",
        columns: [table.user_id],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .uniqueIndex("message_reactions_message_id_user_id_emoji_idx")
      .on(table.message_id, table.user_id, table.emoji),

    t.index("message_reactions_message_id_idx").on(table.message_id),
  ]
);
