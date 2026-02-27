ALTER TABLE "message_receipts" RENAME COLUMN "user_id" TO "reader_id";--> statement-breakpoint
ALTER TABLE "message_receipts" DROP CONSTRAINT "user_fk";
--> statement-breakpoint
DROP INDEX "message_receipts_messageId_userIdIdx";--> statement-breakpoint
DROP INDEX "message_receipts_userId_statusIdx";--> statement-breakpoint
DROP INDEX "message_receipts_conversationId_userId_read_atIdx";--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "user_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "message_receipts_messageId_readerIdIdx" ON "message_receipts" USING btree ("message_id","reader_id");--> statement-breakpoint
CREATE INDEX "message_receipts_readerId_statusIdx" ON "message_receipts" USING btree ("reader_id","status");--> statement-breakpoint
CREATE INDEX "message_receipts_conversationId_readerId_read_atIdx" ON "message_receipts" USING btree ("conversation_id","reader_id","read_at");