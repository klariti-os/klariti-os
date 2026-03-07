CREATE TYPE "public"."goal" AS ENUM('FOCUS', 'WORK', 'STUDY', 'CASUAL');--> statement-breakpoint
ALTER TABLE "profiles" RENAME TO "intents";--> statement-breakpoint
ALTER TABLE "intents" DROP CONSTRAINT "profiles_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "profiles_user_id_idx";--> statement-breakpoint
ALTER TABLE "intents" ADD COLUMN "goal" "goal" NOT NULL DEFAULT 'FOCUS';--> statement-breakpoint
ALTER TABLE "intents" ALTER COLUMN "goal" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "intents" ADD COLUMN "ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "intents" ADD COLUMN "pause_threshold" real;--> statement-breakpoint
ALTER TABLE "intents" ADD CONSTRAINT "intents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "intents_user_id_idx" ON "intents" USING btree ("user_id");