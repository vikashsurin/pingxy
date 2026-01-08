import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { conversations } from "./conversations";

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
    message_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    client_message_id: t.text().unique().notNull(), // ✅ Good for deduplication
    conversation_id: t.integer().notNull(),
    sender_id: t.integer().notNull(),
    content: t.text().notNull(),
    created_at: t.integer().default(sql`extract(epoch from now())`),
    deleted_at: t.integer(),
    updated_at: t.integer().default(sql`extract(epoch from now())`),

    // MISSING IMPORTANT FIELDS:

    // Message status
    is_deleted: t.boolean().default(false).notNull(), // Soft delete flag
    deleted_by: t.integer(), // Who deleted it (sender or admin)

    // Message type and metadata
    message_type: messageTypeEnum("message_type").default("text").notNull(),
    // text, image, video, audio, file, system, etc.

    // Edited status
    is_edited: t.boolean().default(false).notNull(),
    edited_at: t.integer(),

    // Reply/Thread support
    parent_message_id: t.integer(), // For replies/threads
    thread_message_count: t.integer().default(0), // Denormalized count

    // Rich content
    attachments: t.jsonb("attachments"), // Array of file URLs, metadata
    mentions: t.jsonb("mentions"), // Array of mentioned user IDs
    metadata: t.jsonb("metadata"), // Flexible field for reactions, polls, etc.

    // Delivery & read status (optional - can be separate table)
    delivery_status: deliveryStatusEnum("delivery_status").default("sent"),
    // sent, delivered, read, failed

    // Search optimization
    content_vector: t.text("content_vector"), // For full-text search (tsvector in Postgres)

    // Moderation
    is_flagged: t.boolean().default(false),
    flagged_at: t.integer(),
    flagged_reason: t.text(),
  },
  (table) => [
    t
      .foreignKey({
        name: "messages_conversation_fk",
        columns: [table.conversation_id],
        foreignColumns: [conversations.conversation_id] as any,
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "messages_sender_fk",
        columns: [table.sender_id],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "messages_parent_fk",
        columns: [table.parent_message_id],
        foreignColumns: [table.message_id],
      })
      .onDelete("set null"),

    t
      .foreignKey({
        name: "messages_deleted_by_fk",
        columns: [table.deleted_by],
        foreignColumns: [users.id],
      })
      .onDelete("set null"),

    // PRIMARY INDEXES
    t.index("messages_conversation_id_idx").on(table.conversation_id),
    t.index("messages_sender_id_idx").on(table.sender_id),
    t.index("messages_created_at_idx").on(table.created_at),

    // ✅ COMPOSITE - Most common query pattern
    t
      .index("messages_conversation_created_idx")
      .on(table.conversation_id, table.created_at.desc()),

    // For finding replies/threads
    t.index("messages_parent_id_idx").on(table.parent_message_id),

    // For searching user's messages
    t
      .index("messages_sender_created_idx")
      .on(table.sender_id, table.created_at.desc()),

    // Soft delete queries
    t.index("messages_is_deleted_idx").on(table.is_deleted),

    // Full-text search (Postgres specific)
    // t.index("messages_content_search_idx")
    //   .using("gin", table.content_vector),
  ]
);
