import * as t from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import { messages, users } from "@core/db/schema";
// import { users } from "../users/user.schema";

export const messageReceiptStatusEnum = pgEnum("status", [
  "sent",
  "delivered",
  "read",
]);

export const message_receipts = table(
  "message_receipts",
  {
    receipt_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    message_id: t.integer().notNull(),
    user_id: t.integer().notNull(),
    status: messageReceiptStatusEnum("status").notNull(),
    delivered_at: t.timestamp({ withTimezone: true }),
    read_at: t.timestamp({ withTimezone: true }),
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
      .uniqueIndex("message_receipts_message_id_user_id_idx")
      .on(table.message_id, table.user_id),

    t.index("message_receipts_message_id_idx").on(table.message_id),
    t
      .index("message_receipts_user_id_status_idx")
      .on(table.user_id, table.status),
    t.index("message_receipts_read_at_idx").on(table.read_at),
  ]
);
