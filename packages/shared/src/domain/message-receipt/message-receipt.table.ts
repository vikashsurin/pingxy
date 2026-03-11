import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import { messages } from "../message/message.table";
import { users } from "../user/user.table";
import { conversations } from "../conversation/conversation.table";

export const messageReceiptStatusEnum = pgEnum("status", [
  "sent",
  "delivered",
  "read",
]);

export const messageReceipts = table(
  "message_receipts",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    conversationId: t.integer().notNull(),
    messageId: t.integer().notNull(),
    readerId: t.integer().notNull(),
    status: messageReceiptStatusEnum("status").notNull(),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    deliveredAt: t.timestamp({ withTimezone: true }),
    readAt: t.timestamp({ withTimezone: true }),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    t
      .foreignKey({
        name: "message_receipts_message_fk",
        columns: [table.messageId],
        foreignColumns: [messages.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "message_receipts_user_fk",
        columns: [table.readerId],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t.foreignKey({
      name: "message_receipts_conversation_fk",
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
    }),

    t
      .uniqueIndex("message_receipts_messageId_readerIdIdx")
      .on(table.messageId, table.readerId),

    t.index("message_receipts_messageIdIdx").on(table.messageId),
    t
      .index("message_receipts_readerId_statusIdx")
      .on(table.readerId, table.status),
    t.index("message_receipts_read_atIdx").on(table.readAt),
    t.index("message_receipts_conversationIdIdx").on(table.conversationId),
    t
      .index("message_receipts_conversationId_readerId_read_atIdx")
      .on(table.conversationId, table.readerId, table.readAt),
  ],
);
