ALTER TABLE "users" RENAME COLUMN "userName" TO "user_name";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
DROP INDEX "users_usernameIdx";--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "user_name" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_usernameIdx" ON "users" USING btree ("user_name");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_userName_unique" UNIQUE("user_name");