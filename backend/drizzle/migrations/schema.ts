import { pgTable, uniqueIndex, index, foreignKey, integer, text, varchar, boolean, unique, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const conversationType = pgEnum("conversation_type", ['direct', 'group'])
export const role = pgEnum("role", ['admin', 'moderator', 'member'])
export const status = pgEnum("status", ['sent', 'delivered', 'read'])
export const userType = pgEnum("user_type", ['admin', 'moderator', 'user', 'guest'])


export const messages = pgTable("messages", {
	messageId: integer("message_id").primaryKey().generatedAlwaysAsIdentity({ name: "messages_message_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	conversationId: integer("conversation_id").notNull(),
	senderId: text("sender_id").notNull(),
	content: text().notNull(),
	createdAt: integer("created_at").default(sql`EXTRACT(epoch FROM now())`),
	deletedAt: integer("deleted_at"),
	updatedAt: integer("updated_at").default(sql`EXTRACT(epoch FROM now())`),
}, (table) => [
	uniqueIndex("messages_conversation_id_created_at_idx").using("btree", table.conversationId.asc().nullsLast().op("int4_ops"), table.createdAt.asc().nullsLast().op("int4_ops")),
	index("messages_conversation_id_idx").using("btree", table.conversationId.asc().nullsLast().op("int4_ops")),
	index("messages_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("int4_ops")),
	index("messages_sender_id_idx").using("btree", table.senderId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.conversationId],
			name: "conversation_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "user_fk"
		}).onDelete("cascade"),
]);

export const messageReactions = pgTable("message_reactions", {
	reactionId: integer("reaction_id").primaryKey().generatedAlwaysAsIdentity({ name: "message_reactions_reaction_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	messageId: integer("message_id").notNull(),
	userId: text("user_id").notNull(),
	emoji: varchar({ length: 10 }).notNull(),
	createdAt: integer("created_at").default(sql`EXTRACT(epoch FROM now())`),
	updatedAt: integer("updated_at").default(sql`EXTRACT(epoch FROM now())`),
}, (table) => [
	index("message_reactions_message_id_idx").using("btree", table.messageId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("message_reactions_message_id_user_id_emoji_idx").using("btree", table.messageId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("text_ops"), table.emoji.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.messageId],
			name: "message_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_fk"
		}).onDelete("cascade"),
]);

export const messageReceipts = pgTable("message_receipts", {
	receiptId: integer("receipt_id").primaryKey().generatedAlwaysAsIdentity({ name: "message_receipts_receipt_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	messageId: integer("message_id").notNull(),
	userId: text("user_id").notNull(),
	status: status().notNull(),
	deliveredAt: integer("delivered_at"),
	readAt: integer("read_at"),
	createdAt: integer("created_at").default(sql`EXTRACT(epoch FROM now())`),
	updatedAt: integer("updated_at").default(sql`EXTRACT(epoch FROM now())`),
}, (table) => [
	index("message_receipts_message_id_idx").using("btree", table.messageId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("message_receipts_message_id_user_id_idx").using("btree", table.messageId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("int4_ops")),
	index("message_receipts_read_at_idx").using("btree", table.readAt.asc().nullsLast().op("int4_ops")),
	index("message_receipts_user_id_status_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.messageId],
			name: "message_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_fk"
		}).onDelete("cascade"),
]);

export const participants = pgTable("participants", {
	participantId: integer("participant_id").primaryKey().generatedAlwaysAsIdentity({ name: "participants_participant_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	conversationId: integer("conversation_id").notNull(),
	userId: text("user_id").notNull(),
	role: role().notNull(),
	joinedAt: integer("joined_at").default(sql`EXTRACT(epoch FROM now())`),
	leftAt: integer("left_at"),
	isActive: boolean("is_active").default(true),
}, (table) => [
	uniqueIndex("participants_conversation_id_user_id_idx").using("btree", table.conversationId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.conversationId],
			name: "conversation_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	userType: userType("user_type").default('guest'),
	username: text().notNull(),
	passhash: text(),
	data: jsonb().notNull(),
	lastSeenAt: integer("last_seen_at"),
	createdAt: integer("created_at").default(sql`EXTRACT(epoch FROM now())`),
	updatedAt: integer("updated_at").default(sql`EXTRACT(epoch FROM now())`),
}, (table) => [
	uniqueIndex("users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("users_username_unique").on(table.username),
]);

export const blockedUsers = pgTable("blocked_users", {
	blockId: integer("block_id").primaryKey().generatedAlwaysAsIdentity({ name: "blocked_users_block_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	blockerId: text("blocker_id").notNull(),
	blockedId: text("blocked_id").notNull(),
	blockedAt: integer("blocked_at").default(sql`EXTRACT(epoch FROM now())`),
}, (table) => [
	index("blocked_users_blocked_id_idx").using("btree", table.blockedId.asc().nullsLast().op("text_ops")),
	uniqueIndex("blocked_users_blocker_id_blocked_id_idx").using("btree", table.blockerId.asc().nullsLast().op("text_ops"), table.blockedId.asc().nullsLast().op("text_ops")),
	index("blocked_users_blocker_id_idx").using("btree", table.blockerId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.blockerId],
			foreignColumns: [users.id],
			name: "blocker_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.blockedId],
			foreignColumns: [users.id],
			name: "blocked_fk"
		}).onDelete("cascade"),
]);

export const conversations = pgTable("conversations", {
	conversationId: integer("conversation_id").primaryKey().generatedAlwaysAsIdentity({ name: "conversations_conversation_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	conversationType: conversationType("conversation_type").default('direct'),
	name: varchar({ length: 100 }).notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: integer("created_at").default(sql`EXTRACT(epoch FROM now())`),
	updatedAt: integer("updated_at").default(sql`EXTRACT(epoch FROM now())`),
}, (table) => [
	uniqueIndex("conversations_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "author_fk"
		}).onDelete("cascade"),
]);
