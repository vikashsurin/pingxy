ALTER TABLE "conversations" ADD COLUMN "user1_id" integer;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "user2_id" integer;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "max_participants" integer;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_users_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "unique_user_pair" UNIQUE("user1_id","user2_id");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "user_order_check" CHECK ("conversations"."user1_id" < "conversations"."user2_id");