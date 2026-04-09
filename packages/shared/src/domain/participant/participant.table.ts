import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import { messages } from "../message/message.table";
import { users } from "../user/user.table";
import { conversations } from "../conversation/conversation.table";

export const roleEnum = pgEnum("role", ["admin", "moderator", "member"]);

export const participants = table(
  "participants",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    conversationId: t.integer().notNull(),
    userId: t.integer().notNull(),
    role: roleEnum("role").default("member").notNull(), // owner, admin, member
    joinedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    leftAt: t.timestamp({ withTimezone: true }), // When user left the conversation

    // Per-user conversation settings
    isActive: t.boolean().default(true).notNull(),
    isMuted: t.boolean().default(false).notNull(),
    mutedUntil: t.timestamp({ withTimezone: true }),
    isPinned: t.boolean().default(false).notNull(),
    isArchived: t.boolean().default(false).notNull(), // User-level archive
    lastReadMessageId: t.integer(), // Track what user has read
    lastReadAt: t.timestamp({ withTimezone: true }),
    lastDeliveredMessageId: t.integer(),
    lastDeliveredAt: t.timestamp({ withTimezone: true }),
    unreadCount: t.integer().default(0).notNull(), // User-specific unread

    // Notifications
    notificationSettings: t.jsonb("notification_settings"),

    // Soft delete
    isDeleted: t.boolean().default(false).notNull(),
    deletedAt: t.timestamp({ withTimezone: true }),
  },
  (table) => [
    t
      .foreignKey({
        name: "participants_conversation_fk",
        columns: [table.conversationId],
        foreignColumns: [conversations.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "participants_user_fk",
        columns: [table.userId],
        foreignColumns: [users.id],
      })
      .onDelete("cascade"),

    t
      .foreignKey({
        name: "participants_last_read_message_fk",
        columns: [table.lastReadMessageId],
        foreignColumns: [messages.id],
      })
      .onDelete("set null"),

    // CRITICAL: Prevent duplicate participants
    t
      .unique("participants_conversation_user_full_unique")
      .on(table.conversationId, table.userId),

    // Indexes for common queries
    t.index("participants_userIdx").on(table.userId),
    t.index("participants_conversationIdx").on(table.conversationId),
    t.index("participants_left_atIdx").on(table.leftAt),
    t.index("participants_unreadIdx").on(table.userId, table.unreadCount),

    // Composite for fetching user's active conversations
    t
      .index("participants_user_activeIdx")
      .on(table.userId, table.isDeleted, table.leftAt),
  ],
);
