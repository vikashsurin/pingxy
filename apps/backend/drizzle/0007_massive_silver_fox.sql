CREATE TABLE "profiles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profiles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"age" integer NOT NULL,
	"country" text NOT NULL,
	"bio" text
);
--> statement-breakpoint
ALTER TABLE "blocked_users" DROP CONSTRAINT "blocked_users_blocker_fk";
--> statement-breakpoint
ALTER TABLE "blocked_users" DROP CONSTRAINT "blocked_users_blocked_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET DEFAULT 'user'::text;--> statement-breakpoint
DROP TYPE "public"."userType";--> statement-breakpoint
CREATE TYPE "public"."userType" AS ENUM('admin', 'user');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET DEFAULT 'user'::"public"."userType";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET DATA TYPE "public"."userType" USING "type"::"public"."userType";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "gender";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "age";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "bio";