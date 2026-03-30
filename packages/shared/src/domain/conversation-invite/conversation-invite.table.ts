import { conversations } from "../../domain/conversation/conversation.table";
import { users } from "../../domain/user";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";

export const conversationInvites = table(
  "conversation_invites", // Fixed: Changed from "conversations" to avoid collision
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    conversationId: t
      .integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    requiresApproval: t.boolean("requires_approval").default(false).notNull(),
    inviteCode: t.text("invite_code").notNull().unique(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: t.timestamp("expires_at", { withTimezone: true }), // Removed .notNull() for permanent links
    maxUses: t.integer("max_uses"),
    usesCount: t.integer("uses_count").default(0).notNull(),
    createdBy: t
      .integer("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }), // Don't delete the link just because an admin left
  },
  (table) => [
    // Unique index on inviteCode is already handled by .unique() above,
    // but explicit indexes for performance are good:
    t.index("invite_code_idx").on(table.inviteCode),
    t.index("conv_invite_id_idx").on(table.conversationId),
  ],
);
