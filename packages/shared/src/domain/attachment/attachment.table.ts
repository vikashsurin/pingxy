import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { messages } from "../message/message.table";
import { users } from '../../domain/user';

export const attachments = table("attachments", {
  attachmentId: t.text().primaryKey(),
  messageId: t
    .integer()
    .references(() => messages.messageId, { onDelete: "cascade" }),
  url: t.text().notNull(),
  fileName: t.text().notNull(),
  fileSize: t.integer().notNull(),
  mimeType: t.text().notNull(),
  uploadedBy: t.integer().references(() => users.id, { onDelete: "cascade" }),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow(),
});
