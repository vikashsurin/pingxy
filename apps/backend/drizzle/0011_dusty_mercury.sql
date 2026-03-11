ALTER TABLE "attachments" ALTER COLUMN "conversation_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "message_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "uploaded_by" SET NOT NULL;