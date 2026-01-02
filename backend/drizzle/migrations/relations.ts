import { relations } from "drizzle-orm/relations";
import { conversations, messages, users, messageReactions, messageReceipts, participants, blockedUsers } from "./schema";

export const messagesRelations = relations(messages, ({one, many}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.conversationId]
	}),
	user: one(users, {
		fields: [messages.senderId],
		references: [users.id]
	}),
	messageReactions: many(messageReactions),
	messageReceipts: many(messageReceipts),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	messages: many(messages),
	participants: many(participants),
	user: one(users, {
		fields: [conversations.createdBy],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	messages: many(messages),
	messageReactions: many(messageReactions),
	messageReceipts: many(messageReceipts),
	participants: many(participants),
	blockedUsers_blockerId: many(blockedUsers, {
		relationName: "blockedUsers_blockerId_users_id"
	}),
	blockedUsers_blockedId: many(blockedUsers, {
		relationName: "blockedUsers_blockedId_users_id"
	}),
	conversations: many(conversations),
}));

export const messageReactionsRelations = relations(messageReactions, ({one}) => ({
	message: one(messages, {
		fields: [messageReactions.messageId],
		references: [messages.messageId]
	}),
	user: one(users, {
		fields: [messageReactions.userId],
		references: [users.id]
	}),
}));

export const messageReceiptsRelations = relations(messageReceipts, ({one}) => ({
	message: one(messages, {
		fields: [messageReceipts.messageId],
		references: [messages.messageId]
	}),
	user: one(users, {
		fields: [messageReceipts.userId],
		references: [users.id]
	}),
}));

export const participantsRelations = relations(participants, ({one}) => ({
	conversation: one(conversations, {
		fields: [participants.conversationId],
		references: [conversations.conversationId]
	}),
	user: one(users, {
		fields: [participants.userId],
		references: [users.id]
	}),
}));

export const blockedUsersRelations = relations(blockedUsers, ({one}) => ({
	user_blockerId: one(users, {
		fields: [blockedUsers.blockerId],
		references: [users.id],
		relationName: "blockedUsers_blockerId_users_id"
	}),
	user_blockedId: one(users, {
		fields: [blockedUsers.blockedId],
		references: [users.id],
		relationName: "blockedUsers_blockedId_users_id"
	}),
}));