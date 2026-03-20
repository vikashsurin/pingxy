ALTER TABLE "conversations" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "last_delivered_message_id" integer;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "last_delivered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "data";