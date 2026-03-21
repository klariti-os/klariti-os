CREATE TYPE "public"."ktag_status" AS ENUM('active', 'revoked');
--> statement-breakpoint
ALTER TABLE "ktags" ALTER COLUMN "payload" TYPE varchar(1024);
--> statement-breakpoint
ALTER TABLE "ktags" ADD COLUMN "uid_hash" varchar(128);
--> statement-breakpoint
ALTER TABLE "ktags" ADD COLUMN "signature" varchar(512);
--> statement-breakpoint
ALTER TABLE "ktags" ADD COLUMN "sig_version" integer;
--> statement-breakpoint
ALTER TABLE "ktags" ADD COLUMN "status" "ktag_status" DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "ktags" ADD COLUMN "tag_type" varchar(64);
--> statement-breakpoint
ALTER TABLE "ktags" ADD COLUMN "revoked_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "ktags" ADD CONSTRAINT "ktags_uid_hash_unique" UNIQUE("uid_hash");
--> statement-breakpoint
CREATE INDEX "ktags_status_idx" ON "ktags" USING btree ("status");
