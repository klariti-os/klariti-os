ALTER TABLE "profiles" ADD COLUMN "age" integer;
--> statement-breakpoint
DROP TABLE "users" CASCADE;
