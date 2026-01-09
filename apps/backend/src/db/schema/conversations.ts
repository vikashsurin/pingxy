import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from "./users";

export const conversationTypesEnum = t.pgEnum("conversation_type", [
  "direct",
  "group",
]);

export const conversations = table(
  "conversations",
  {
    conversation_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    conversation_type:
      conversationTypesEnum("conversation_type").default("direct"),
    name: t.varchar("name", { length: 100 }),
    last_message_id: t.integer(),
    last_message_at: t.integer(),
    is_deleted: t.boolean().default(false).notNull(),
    created_by: t.integer(),
    created_at: t.integer().default(sql`extract(epoch from now())`),
    updated_at: t.integer().default(sql`extract(epoch from now())`),
  },
  (table) => [
    t
      .foreignKey({
        name: "conversations_created_by_fk",
        columns: [table.created_by],
        foreignColumns: [users.id],
      })
      .onDelete("cascade")
      .onUpdate("cascade"),

    t.index("conversations_created_by_idx").on(table.created_by),
    t.index("conversations_last_message_at_idx").on(table.last_message_at),
    t.index("conversations_last_message_id_idx").on(table.last_message_id),
  ]
);
