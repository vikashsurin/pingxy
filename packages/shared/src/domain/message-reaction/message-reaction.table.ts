import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { messages } from "../message/message.table";
import { users } from "../user/user.table";

export const messageReactions = table(
  "message_reactions",
  {
    reactionId: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    messageId: t.integer().notNull(),
    userId: t.integer().notNull(),
    emoji: t.varchar("emoji", { length: 10 }).notNull(),
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
        name: "message_reactions_message_fk",
        columns: [table.messageId],
        foreignColumns: [messages.messageId],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "message_reactions_user_fk",
        columns: [table.userId],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .uniqueIndex("message_reactions_messageId_userId_emojiIdx")
      .on(table.messageId, table.userId, table.emoji),

    t.index("message_reactions_messageIdIdx").on(table.messageId),
  ],
);
