ALTER TABLE "messages" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "attachments";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "delivery_status";