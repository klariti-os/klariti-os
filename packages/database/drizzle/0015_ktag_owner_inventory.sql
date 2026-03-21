ALTER TABLE "ktags" DROP CONSTRAINT "ktags_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "ktags" RENAME COLUMN "user_id" TO "owner_id";
--> statement-breakpoint
ALTER TABLE "ktags" ALTER COLUMN "owner_id" DROP NOT NULL;
--> statement-breakpoint
ALTER INDEX "ktags_user_id_idx" RENAME TO "ktags_owner_id_idx";
--> statement-breakpoint
ALTER TABLE "ktags" ADD CONSTRAINT "ktags_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
