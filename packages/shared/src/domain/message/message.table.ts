import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import { conversations } from "../conversation/conversation.table";
import { users } from "../user/user.table";

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "video",
  "audio",
  "file",
  "system",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "sent",
  "delivered",
  "read",
  "failed",
]);

export const messages = table(
  "messages",
  {
    messageId: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    clientMessageId: t.text().unique().notNull(),
    conversationId: t.integer().notNull(),
    senderId: t.integer().notNull(),
    content: t.text(),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    deletedAt: t.timestamp({ withTimezone: true }),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),

    isDeleted: t.boolean().default(false).notNull(), // Soft delete flag
    deletedBy: t.integer(), // Who deleted it (sender or admin)

    messageType: messageTypeEnum("message_type").default("text").notNull(),

    isEdited: t.boolean().default(false).notNull(),
    editedAt: t.timestamp({ withTimezone: true }),

    parentMessageId: t.integer(), // For replies/threads
    threadMessageCount: t.integer().default(0), // Denormalized count

    mentions: t.jsonb("mentions").$type<any>(),

    contentVector: t.text("content_vector"),

    isFlagged: t.boolean().default(false),
    flaggedAt: t.timestamp({ withTimezone: true }),
    flaggedReason: t.text(),
  },
  (table) => [
    t
      .foreignKey({
        name: "messages_conversation_fk",
        columns: [table.conversationId],
        foreignColumns: [conversations.conversationId] as any,
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "messages_sender_fk",
        columns: [table.senderId],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "messages_parent_fk",
        columns: [table.parentMessageId],
        foreignColumns: [table.messageId],
      })
      .onDelete("set null"),

    t
      .foreignKey({
        name: "messages_deleted_by_fk",
        columns: [table.deletedBy],
        foreignColumns: [users.id],
      })
      .onDelete("set null"),

    // PRIMARY INDEXES
    t.index("messages_conversationIdIdx").on(table.conversationId),
    t.index("messages_senderIdIdx").on(table.senderId),
    t.index("messages_created_atIdx").on(table.createdAt),

    // ✅ COMPOSITE - Most common query pattern
    t
      .index("messages_conversation_createdIdx")
      .on(table.conversationId, table.createdAt.desc()),

    // For finding replies/threads
    t.index("messages_parentIdIdx").on(table.parentMessageId),

    // For searching user's messages
    t
      .index("messages_sender_createdIdx")
      .on(table.senderId, table.createdAt.desc()),

    // Soft delete queries
    t.index("messages_is_deletedIdx").on(table.isDeleted),

    // Full-text search (Postgres specific)
    // t.index("messages_content_searchIdx")
    //   .using("gin", table.contentVector),
  ],
);
