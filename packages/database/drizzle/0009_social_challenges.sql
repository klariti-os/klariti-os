CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('invited', 'active', 'paused', 'declined', 'completed');--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"challenge_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" "participant_status" DEFAULT 'invited' NOT NULL,
	"joined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "challenge_participants_challenge_id_user_id_pk" PRIMARY KEY("challenge_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"requester_id" text NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "intents" RENAME TO "challenges";--> statement-breakpoint
ALTER TABLE "challenges" RENAME COLUMN "user_id" TO "creator_id";--> statement-breakpoint
ALTER TABLE "challenges" DROP CONSTRAINT "intents_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "intents_user_id_idx";--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_a_id_user_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_b_id_user_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_participants_user_id_idx" ON "challenge_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "friendships_user_a_idx" ON "friendships" USING btree ("user_a_id");--> statement-breakpoint
CREATE INDEX "friendships_user_b_idx" ON "friendships" USING btree ("user_b_id");--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenges_creator_id_idx" ON "challenges" USING btree ("creator_id");--> statement-breakpoint
ALTER TABLE "challenges" DROP COLUMN "is_active";