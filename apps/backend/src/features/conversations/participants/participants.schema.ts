import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import { conversations, messages, users } from "@core/db/schema";

export const participantRoleEnum = pgEnum("role", [
  "admin",
  "moderator",
  "member",
]);

export const participants = table(
  "participants",
  {
    participant_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    conversation_id: t.integer().notNull(),
    user_id: t.integer().notNull(),
    role: participantRoleEnum("role").default("member").notNull(), // owner, admin, member
    joined_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    left_at: t.timestamp({ withTimezone: true }), // When user left the conversation

    // Per-user conversation settings
    is_active: t.boolean().default(true).notNull(),
    is_muted: t.boolean().default(false).notNull(),
    muted_until: t.timestamp({ withTimezone: true }),
    is_pinned: t.boolean().default(false).notNull(),
    is_archived: t.boolean().default(false).notNull(), // User-level archive
    last_read_message_id: t.integer(), // Track what user has read
    last_read_at: t.timestamp({ withTimezone: true }),
    unread_count: t.integer().default(0).notNull(), // User-specific unread

    // Notifications
    notification_settings: t.jsonb("notification_settings"),

    // Soft delete
    is_deleted: t.boolean().default(false).notNull(),
    deleted_at: t.timestamp({ withTimezone: true }),
  },
  (table) => [
    t
      .foreignKey({
        name: "participants_conversation_fk",
        columns: [table.conversation_id],
        foreignColumns: [conversations.conversation_id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "participants_user_fk",
        columns: [table.user_id],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "participants_last_read_message_fk",
        columns: [table.last_read_message_id],
        foreignColumns: [messages.message_id],
      })
      .onDelete("set null"),

    // CRITICAL: Prevent duplicate participants
    t
      .unique("participants_conversation_user_full_unique")
      .on(table.conversation_id, table.user_id),

    // Indexes for common queries
    t.index("participants_user_idx").on(table.user_id),
    t.index("participants_conversation_idx").on(table.conversation_id),
    t.index("participants_left_at_idx").on(table.left_at),
    t.index("participants_unread_idx").on(table.user_id, table.unread_count),

    // Composite for fetching user's active conversations
    t
      .index("participants_user_active_idx")
      .on(table.user_id, table.is_deleted, table.left_at),
  ]
);
