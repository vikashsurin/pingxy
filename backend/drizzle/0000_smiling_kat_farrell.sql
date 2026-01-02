CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"user_type" "user_type" DEFAULT 'guest',
	"username" text NOT NULL,
	"passhash" text,
	"data" json NOT NULL,
	"last_seen_at" integer,
	"created_at" integer DEFAULT extract(epoch from now()),
	"updated_at" integer DEFAULT extract(epoch from now()),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");