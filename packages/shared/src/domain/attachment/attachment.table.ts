import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "../../domain/user";
import { messages } from "../message/message.table";

export const attachments = table(
  "attachments",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    messageId: t.integer().notNull().references(() => messages.id, { onDelete: "cascade" }),
    uploadedBy: t.integer().notNull().references(() => users.id, { onDelete: "cascade" }),
    key: t.text().notNull(),
    thumbKey: t.text(),
    fileName: t.text().notNull(),
    fileSize: t.integer().notNull(),
    mimeType: t.text().notNull(),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    t.index("attachments_message_idx").on(table.messageId),
    t.index("attachments_uploaded_by_idx").on(table.uploadedBy),
  ]
)
