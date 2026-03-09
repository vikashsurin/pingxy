import * as t from "drizzle-orm/pg-core";
import { pgTable as table, } from "drizzle-orm/pg-core";
import { users } from '../../domain/user';
import { messages } from "../message/message.table";

export const attachments = table("attachments", {
  attachmentId: t.text().primaryKey(),
  messageId: t
    .integer()
    .references(() => messages.messageId, { onDelete: "cascade" }),
  url: t.text().notNull(),
  key: t.text().notNull(),
  thumbnailUrl: t.text(),
  thumbKey: t.text(),
  fileName: t.text().notNull(),
  fileSize: t.integer().notNull(),
  mimeType: t.text().notNull(),
  uploadedBy: t.integer().references(() => users.id, { onDelete: "cascade" }),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  t.index('message_idx').on(table.messageId),
]);
