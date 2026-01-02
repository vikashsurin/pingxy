CREATE TABLE "blocked_users" (
	"block_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blocked_users_block_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"blocker_id" text NOT NULL,
	"blocked_id" text NOT NULL,
	"blocked_at" integer DEFAULT extract(epoch from now())
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"conversation_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversations_conversation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversation_type" "conversation_type" DEFAULT 'direct',
	"name" varchar(100) NOT NULL,
	"created_by" text NOT NULL,
	"created_at" integer DEFAULT extract(epoch from now()),
	"updated_at" integer DEFAULT extract(epoch from now())
);
--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"reaction_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_reactions_reaction_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"message_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"created_at" integer DEFAULT extract(epoch from now()),
	"updated_at" integer DEFAULT extract(epoch from now())
);
--> statement-breakpoint
CREATE TABLE "message_receipts" (
	"receipt_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_receipts_receipt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"message_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"status" "status" NOT NULL,
	"delivered_at" integer,
	"read_at" integer,
	"created_at" integer DEFAULT extract(epoch from now()),
	"updated_at" integer DEFAULT extract(epoch from now())
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_message_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversation_id" integer NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" integer DEFAULT extract(epoch from now()),
	"deleted_at" integer,
	"updated_at" integer DEFAULT extract(epoch from now())
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"participant_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "participants_participant_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversation_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"role" "role" NOT NULL,
	"joined_at" integer DEFAULT extract(epoch from now()),
	"left_at" integer,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocker_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "author_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "conversation_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "user_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "conversation_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blocked_users_blocker_id_blocked_id_idx" ON "blocked_users" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blocker_id_idx" ON "blocked_users" USING btree ("blocker_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blocked_id_idx" ON "blocked_users" USING btree ("blocked_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_created_by_idx" ON "conversations" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "message_reactions_message_id_user_id_emoji_idx" ON "message_reactions" USING btree ("message_id","user_id","emoji");--> statement-breakpoint
CREATE INDEX "message_reactions_message_id_idx" ON "message_reactions" USING btree ("message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "message_receipts_message_id_user_id_idx" ON "message_receipts" USING btree ("message_id","user_id");--> statement-breakpoint
CREATE INDEX "message_receipts_message_id_idx" ON "message_receipts" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_receipts_user_id_status_idx" ON "message_receipts" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "message_receipts_read_at_idx" ON "message_receipts" USING btree ("read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_conversation_id_created_at_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_conversation_id_user_id_idx" ON "participants" USING btree ("conversation_id","user_id");