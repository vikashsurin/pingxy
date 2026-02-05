DROP INDEX "blocked_users_blocker_id_blocked_id_idx";--> statement-breakpoint
DROP INDEX "blocked_users_blocker_id_idx";--> statement-breakpoint
DROP INDEX "blocked_users_blocked_id_idx";--> statement-breakpoint
DROP INDEX "conversations_created_by_idx";--> statement-breakpoint
DROP INDEX "conversations_last_message_at_idx";--> statement-breakpoint
DROP INDEX "conversations_last_message_id_idx";--> statement-breakpoint
DROP INDEX "message_reactions_message_id_user_id_emoji_idx";--> statement-breakpoint
DROP INDEX "message_reactions_message_id_idx";--> statement-breakpoint
DROP INDEX "message_receipts_message_id_user_id_idx";--> statement-breakpoint
DROP INDEX "message_receipts_message_id_idx";--> statement-breakpoint
DROP INDEX "message_receipts_user_id_status_idx";--> statement-breakpoint
DROP INDEX "message_receipts_read_at_idx";--> statement-breakpoint
DROP INDEX "message_receipts_conversation_id_idx";--> statement-breakpoint
DROP INDEX "message_receipts_conversation_id_user_id_read_at_idx";--> statement-breakpoint
DROP INDEX "messages_conversation_id_idx";--> statement-breakpoint
DROP INDEX "messages_sender_id_idx";--> statement-breakpoint
DROP INDEX "messages_created_at_idx";--> statement-breakpoint
DROP INDEX "messages_conversation_created_idx";--> statement-breakpoint
DROP INDEX "messages_parent_id_idx";--> statement-breakpoint
DROP INDEX "messages_sender_created_idx";--> statement-breakpoint
DROP INDEX "messages_is_deleted_idx";--> statement-breakpoint
DROP INDEX "participants_user_idx";--> statement-breakpoint
DROP INDEX "participants_conversation_idx";--> statement-breakpoint
DROP INDEX "participants_left_at_idx";--> statement-breakpoint
DROP INDEX "participants_unread_idx";--> statement-breakpoint
DROP INDEX "participants_user_active_idx";--> statement-breakpoint
DROP INDEX "refresh_tokens_user_id_idx";--> statement-breakpoint
DROP INDEX "refresh_token_user_id_session_id_idx";--> statement-breakpoint
DROP INDEX "refresh_token_expires_at_idx";--> statement-breakpoint
DROP INDEX "sessions_user_id_idx";--> statement-breakpoint
DROP INDEX "session_expires_at_idx";--> statement-breakpoint
DROP INDEX "sessions_ip_address_idx";--> statement-breakpoint
DROP INDEX "session_is_active_last_activity_idx";--> statement-breakpoint
DROP INDEX "users_username_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "blocked_users_blockerId_blockedIdIdx" ON "blocked_users" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blockerIdIdx" ON "blocked_users" USING btree ("blocker_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blockedIdIdx" ON "blocked_users" USING btree ("blocked_id");--> statement-breakpoint
CREATE INDEX "conversations_created_byIdx" ON "conversations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "conversations_last_message_atIdx" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "conversations_last_messageIdIdx" ON "conversations" USING btree ("last_message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "message_reactions_messageId_userId_emojiIdx" ON "message_reactions" USING btree ("message_id","user_id","emoji");--> statement-breakpoint
CREATE INDEX "message_reactions_messageIdIdx" ON "message_reactions" USING btree ("message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "message_receipts_messageId_userIdIdx" ON "message_receipts" USING btree ("message_id","user_id");--> statement-breakpoint
CREATE INDEX "message_receipts_messageIdIdx" ON "message_receipts" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_receipts_userId_statusIdx" ON "message_receipts" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "message_receipts_read_atIdx" ON "message_receipts" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "message_receipts_conversationIdIdx" ON "message_receipts" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_receipts_conversationId_userId_read_atIdx" ON "message_receipts" USING btree ("conversation_id","user_id","read_at");--> statement-breakpoint
CREATE INDEX "messages_conversationIdIdx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_senderIdIdx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_created_atIdx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_createdIdx" ON "messages" USING btree ("conversation_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "messages_parentIdIdx" ON "messages" USING btree ("parent_message_id");--> statement-breakpoint
CREATE INDEX "messages_sender_createdIdx" ON "messages" USING btree ("sender_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "messages_is_deletedIdx" ON "messages" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "participants_userIdx" ON "participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "participants_conversationIdx" ON "participants" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "participants_left_atIdx" ON "participants" USING btree ("left_at");--> statement-breakpoint
CREATE INDEX "participants_unreadIdx" ON "participants" USING btree ("user_id","unread_count");--> statement-breakpoint
CREATE INDEX "participants_user_activeIdx" ON "participants" USING btree ("user_id","is_deleted","left_at");--> statement-breakpoint
CREATE INDEX "refresh_tokens_userIdIdx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "refresh_token_userId_sessionIdIdx" ON "refresh_tokens" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "refresh_token_expires_atIdx" ON "refresh_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_userIdIdx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_atIdx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_ipAddressIdx" ON "sessions" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "session_is_active_lastActivityIdx" ON "sessions" USING btree ("is_active","last_activity");--> statement-breakpoint
CREATE UNIQUE INDEX "users_usernameIdx" ON "users" USING btree ("username");