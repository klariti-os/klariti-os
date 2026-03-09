-- Recreate participant_status without deprecated 'invited' and 'declined' values
ALTER TABLE "challenge_participants" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
DELETE FROM "challenge_participants" WHERE "status" IN ('invited', 'declined');--> statement-breakpoint
ALTER TABLE "challenge_participants" ALTER COLUMN "status" TYPE text USING "status"::text;--> statement-breakpoint
DROP TYPE "public"."participant_status";--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('active', 'paused', 'completed');--> statement-breakpoint
ALTER TABLE "challenge_participants" ALTER COLUMN "status" TYPE "public"."participant_status" USING "status"::"public"."participant_status";--> statement-breakpoint
ALTER TABLE "challenge_participants" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint

-- Create challenge_request_status enum
CREATE TYPE "public"."challenge_request_status" AS ENUM('pending', 'accepted', 'declined', 'withdrawn', 'ignored');--> statement-breakpoint

-- Create challenge_requests table
CREATE TABLE "challenge_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"from_id" text NOT NULL,
	"to_id" text NOT NULL,
	"status" "challenge_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);--> statement-breakpoint
ALTER TABLE "challenge_requests" ADD CONSTRAINT "challenge_requests_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_requests" ADD CONSTRAINT "challenge_requests_from_id_user_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_requests" ADD CONSTRAINT "challenge_requests_to_id_user_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_requests_challenge_id_idx" ON "challenge_requests" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "challenge_requests_from_idx" ON "challenge_requests" USING btree ("from_id");--> statement-breakpoint
CREATE INDEX "challenge_requests_to_idx" ON "challenge_requests" USING btree ("to_id");
