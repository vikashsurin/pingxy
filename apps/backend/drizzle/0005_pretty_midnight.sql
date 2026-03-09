ALTER TABLE "attachments" ALTER COLUMN "message_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "thumb_key" text;--> statement-breakpoint
CREATE INDEX "message_idx" ON "attachments" USING btree ("message_id");