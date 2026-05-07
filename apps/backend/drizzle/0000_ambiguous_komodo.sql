CREATE TYPE "public"."conversationType" AS ENUM('direct', 'group');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('sent', 'delivered', 'read');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'video', 'audio', 'file', 'system');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'moderator', 'member');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."userType" AS ENUM('admin', 'moderator', 'user', 'guest');--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"message_id" integer NOT NULL,
	"uploaded_by" integer NOT NULL,
	"key" text NOT NULL,
	"thumb_key" text,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blocked_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"blocker_id" integer NOT NULL,
	"blocked_id" integer NOT NULL,
	"blocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "conversationType" DEFAULT 'direct',
	"name" varchar(100),
	"last_message_id" integer,
	"last_message_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_reactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_receipts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_receipts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversation_id" integer NOT NULL,
	"message_id" integer NOT NULL,
	"reader_id" integer NOT NULL,
	"status" "status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_message_id" text NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" integer,
	"message_type" "message_type" DEFAULT 'text' NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp with time zone,
	"parent_message_id" integer,
	"thread_message_count" integer DEFAULT 0,
	"mentions" jsonb,
	"content_vector" text,
	"is_flagged" boolean DEFAULT false,
	"flagged_at" timestamp with time zone,
	"flagged_reason" text,
	CONSTRAINT "messages_clientMessageId_unique" UNIQUE("client_message_id")
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "participants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversation_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"muted_until" timestamp with time zone,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"last_read_message_id" integer,
	"last_read_at" timestamp with time zone,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"notification_settings" jsonb,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "participants_conversation_user_full_unique" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "refresh_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"refresh_token" text NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"created_at" integer DEFAULT extract(epoch from now()),
	"updated_at" integer DEFAULT extract(epoch from now()),
	"expires_at" integer
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hashed_token" text NOT NULL,
	"user_id" integer NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"refresh_token" text,
	"is_active" boolean DEFAULT true,
	"last_activity" integer DEFAULT extract(epoch from now()),
	"created_at" integer DEFAULT extract(epoch from now()),
	"updated_at" integer DEFAULT extract(epoch from now()),
	"expires_at" integer,
	CONSTRAINT "sessions_hashedToken_unique" UNIQUE("hashed_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "userType" DEFAULT 'guest',
	"email" text,
	"userName" text NOT NULL,
	"hashed_password" text,
	"gender" "gender" DEFAULT 'other' NOT NULL,
	"age" integer DEFAULT 18 NOT NULL,
	"country" text DEFAULT 'AF' NOT NULL,
	"bio" text,
	"data" jsonb,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("userName")
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocker_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_message_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_user_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_conversation_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_fk" FOREIGN KEY ("parent_message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_deleted_by_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_conversation_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_last_read_message_fk" FOREIGN KEY ("last_read_message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_message_idx" ON "attachments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "attachments_uploaded_by_idx" ON "attachments" USING btree ("uploaded_by");--> statement-breakpoint
CREATE UNIQUE INDEX "blocked_users_blockerId_blockedIdIdx" ON "blocked_users" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blockerIdIdx" ON "blocked_users" USING btree ("blocker_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blockedIdIdx" ON "blocked_users" USING btree ("blocked_id");--> statement-breakpoint
CREATE INDEX "conversations_created_byIdx" ON "conversations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "conversations_last_message_atIdx" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE UNIQUE INDEX "message_reactions_messageId_userId_emojiIdx" ON "message_reactions" USING btree ("message_id","user_id","emoji");--> statement-breakpoint
CREATE INDEX "message_reactions_messageIdIdx" ON "message_reactions" USING btree ("message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "message_receipts_messageId_readerIdIdx" ON "message_receipts" USING btree ("message_id","reader_id");--> statement-breakpoint
CREATE INDEX "message_receipts_messageIdIdx" ON "message_receipts" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_receipts_readerId_statusIdx" ON "message_receipts" USING btree ("reader_id","status");--> statement-breakpoint
CREATE INDEX "message_receipts_read_atIdx" ON "message_receipts" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "message_receipts_conversationIdIdx" ON "message_receipts" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_receipts_conversationId_readerId_read_atIdx" ON "message_receipts" USING btree ("conversation_id","reader_id","read_at");--> statement-breakpoint
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
CREATE UNIQUE INDEX "users_usernameIdx" ON "users" USING btree ("userName");