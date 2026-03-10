import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "../../domain/user";
import { messages } from "../message/message.table";
import { conversations } from "../conversation/conversation.table";

export const attachments = table(
  "attachments",
  {
    attachmentId: t.text().primaryKey(),
    conversationId: t
      .integer()
      .notNull()
      .references(() => conversations.conversationId, { onDelete: "cascade" }),
    messageId: t
      .integer()
      .notNull()
      .references(() => messages.messageId, { onDelete: "cascade" }),
    key: t.text().notNull(),
    url: t.text().notNull(),
    thumbnailUrl: t.text(),
    thumbKey: t.text(),
    fileName: t.text().notNull(),
    fileSize: t.integer().notNull(),
    mimeType: t.text().notNull(),
    uploadedBy: t.integer().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    t.index("message_idx").on(table.messageId),
    t.index("attachment_conversation_idx").on(table.conversationId),
  ],
);
