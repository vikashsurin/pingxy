import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { conversations } from "../conversation/conversation.table";
import { users } from "../user";

export const memberShipStatusEnum = t.pgEnum("status", [
  "pending",
  "approved",
  "declined",
]);

export const membershipRequests = table(
  "membership_requests",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    conversationId: t
      .integer()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inviteCodeUsed: t.text().notNull(),
    status: memberShipStatusEnum().default("pending").notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
  },
  (table) => [t.index("conv_id_idx").on(table.conversationId)],
);
