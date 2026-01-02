
import { sql } from "drizzle-orm";
import { pgTable as table, pgEnum } from "drizzle-orm/pg-core";
import * as t from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";



const userTypesEnum = pgEnum('user_type', ['admin', 'moderator', 'user', 'guest'])

export const users = table("users", {
  id: t.text().primaryKey(),
  user_type: userTypesEnum('user_type').default('guest'),
  username: t.text().notNull().unique(),
  passhash: t.text(),
  data: t.jsonb().notNull(),
  last_seen_at: t.integer(),
  created_at: t.integer().default(sql`extract(epoch from now())`),
  updated_at: t.integer().default(sql`extract(epoch from now())`),
},
  (table) => [
    t.uniqueIndex('users_username_idx').on(table.username)
  ]
)

const conversationTypesEnum = pgEnum('conversation_type', ['direct', 'group']);

export const conversations = table("conversations", {
  conversation_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  conversation_type: conversationTypesEnum('conversation_type').default('direct'),
  name: t.varchar('name', { length: 100 }).notNull(),
  created_by: t.text().notNull(),
  created_at: t.integer().default(sql`extract(epoch from now())`),
  updated_at: t.integer().default(sql`extract(epoch from now())`),
},
  (table) => [
    t.foreignKey({
      name: 'author_fk',
      columns: [table.created_by],
      foreignColumns: [users.id],
    }).onDelete('cascade'),

    t.uniqueIndex('conversations_created_by_idx').on(table.created_by)
  ]
)

const rolesEnum = pgEnum('role', ['admin', 'moderator', 'member'])

export const participants = table("participants", {
  participant_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  conversation_id: t.integer().notNull(),
  user_id: t.text().notNull(),
  role: rolesEnum('role').notNull(),
  joined_at: t.integer().default(sql`extract(epoch from now())`),
  left_at: t.integer(),
  is_active: t.boolean().default(true),
},
  (table) => [
    t.foreignKey({
      name: 'conversation_fk',
      columns: [table.conversation_id],
      foreignColumns: [conversations.conversation_id],
    }).onDelete('cascade'),

    t.foreignKey({
      name: 'user_fk',
      columns: [table.user_id],
      foreignColumns: [users.id],
    }).onDelete('cascade'),

    t.uniqueIndex('participants_conversation_id_user_id_idx').on(table.conversation_id, table.user_id)
  ]
)


export const messages = table("messages", {
  message_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  conversation_id: t.integer().notNull(),
  sender_id: t.text().notNull(),
  content: t.text().notNull(),
  created_at: t.integer().default(sql`extract(epoch from now())`),
  deleted_at: t.integer(),
  updated_at: t.integer().default(sql`extract(epoch from now())`),
},
  (table) => [
    t.foreignKey({
      name: 'conversation_fk',
      columns: [table.conversation_id],
      foreignColumns: [conversations.conversation_id],
    }).onDelete('cascade'),

    t.foreignKey({
      name: 'user_fk',
      columns: [table.sender_id],
      foreignColumns: [users.id],
    }).onDelete('cascade'),

    t.uniqueIndex('messages_conversation_id_created_at_idx').on(table.conversation_id, table.created_at),

    t.index('messages_conversation_id_idx').on(table.conversation_id),
    t.index('messages_sender_id_idx').on(table.sender_id),
    t.index('messages_created_at_idx').on(table.created_at),

  ]
)

const messageReceiptStatusEnum = pgEnum('status', ['sent', 'delivered', 'read'])

export const message_receipts = table("message_receipts", {
  receipt_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  message_id: t.integer().notNull(),
  user_id: t.text().notNull(),
  status: messageReceiptStatusEnum('status').notNull(),
  delivered_at: t.integer(),
  read_at: t.integer(),
  created_at: t.integer().default(sql`extract(epoch from now())`),
  updated_at: t.integer().default(sql`extract(epoch from now())`),
},
  (table) => [
    t.foreignKey({
      name: 'message_fk',
      columns: [table.message_id],
      foreignColumns: [messages.message_id],
    }).onDelete('cascade'),

    t.foreignKey({
      name: 'user_fk',
      columns: [table.user_id],
      foreignColumns: [users.id],
    }).onDelete('cascade'),

    t.uniqueIndex('message_receipts_message_id_user_id_idx').on(table.message_id, table.user_id),

    t.index('message_receipts_message_id_idx').on(table.message_id),
    t.index('message_receipts_user_id_status_idx').on(table.user_id, table.status),
    t.index("message_receipts_read_at_idx").on(table.read_at),

  ]
)

export const message_reactions = table("message_reactions", {
  reaction_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  message_id: t.integer().notNull(),
  user_id: t.text().notNull(),
  emoji: t.varchar('emoji', { length: 10 }).notNull(),
  created_at: t.integer().default(sql`extract(epoch from now())`),
  updated_at: t.integer().default(sql`extract(epoch from now())`),
},
  (table) => [
    t.foreignKey({
      name: 'message_fk',
      columns: [table.message_id],
      foreignColumns: [messages.message_id],
    }).onDelete('cascade'),

    t.foreignKey({
      name: 'user_fk',
      columns: [table.user_id],
      foreignColumns: [users.id],
    }).onDelete('cascade'),

    t.uniqueIndex('message_reactions_message_id_user_id_emoji_idx').on(table.message_id, table.user_id, table.emoji),

    t.index('message_reactions_message_id_idx').on(table.message_id),

  ]
)

export const blocked_users = table("blocked_users", {
  block_id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  blocker_id: t.text().notNull(),
  blocked_id: t.text().notNull(),
  blocked_at: t.integer().default(sql`extract(epoch from now())`),
},
  (table) => [
    t.foreignKey({
      name: 'blocker_fk',
      columns: [table.blocker_id],
      foreignColumns: [users.id],
    }).onDelete('cascade'),

    t.foreignKey({
      name: 'blocked_fk',
      columns: [table.blocked_id],
      foreignColumns: [users.id],
    }).onDelete('cascade'),

    t.uniqueIndex('blocked_users_blocker_id_blocked_id_idx').on(table.blocker_id, table.blocked_id),

    t.index('blocked_users_blocker_id_idx').on(table.blocker_id),
    t.index('blocked_users_blocked_id_idx').on(table.blocked_id),

  ]
)



export const userSelectSchema = createSelectSchema(users)
export const userInsertSchema = createInsertSchema(users)
export const userUpdateSchema = createUpdateSchema(users)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert

export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

export type MessageReceipt = typeof message_receipts.$inferSelect
export type NewMessageReceipt = typeof message_receipts.$inferInsert

export type MessageReaction = typeof message_reactions.$inferSelect
export type NewMessageReaction = typeof message_reactions.$inferInsert

export type BlockedUser = typeof blocked_users.$inferSelect
export type NewBlockedUser = typeof blocked_users.$inferInsert
