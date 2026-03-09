-- Idempotent migration: only runs if friendships is still in the old format
-- (detected by the presence of the requester_id column).
-- Migrates: friendship_status enum → friendship_state + friend_request_status,
--           friendships table (pending/accepted/blocked, requester_id) →
--             friendships (active/removed, unique pair) + friend_requests (audit log)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friendships' AND column_name = 'requester_id'
  ) THEN

    -- 1. Create new enums (safe if already exist from a partial previous run)
    BEGIN
      CREATE TYPE "friendship_state" AS ENUM ('active', 'removed');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      CREATE TYPE "friend_request_status" AS ENUM ('pending', 'accepted', 'declined', 'cancelled');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    -- 2. Create friend_requests table (audit log of each request)
    CREATE TABLE IF NOT EXISTS "friend_requests" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "from_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "to_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "status" "friend_request_status" NOT NULL DEFAULT 'pending',
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "friend_requests_from_idx" ON "friend_requests" ("from_id");
    CREATE INDEX IF NOT EXISTS "friend_requests_to_idx" ON "friend_requests" ("to_id");

    -- 3. Migrate existing friendships into friend_requests
    --    pending  → pending request
    --    accepted → accepted request (friendship also lives in friendships table)
    --    blocked  → declined request
    INSERT INTO "friend_requests" ("from_id", "to_id", "status", "created_at", "updated_at")
    SELECT
      "requester_id",
      CASE WHEN "user_a_id" = "requester_id" THEN "user_b_id" ELSE "user_a_id" END,
      CASE "status"::text
        WHEN 'pending'  THEN 'pending'::friend_request_status
        WHEN 'accepted' THEN 'accepted'::friend_request_status
        WHEN 'blocked'  THEN 'declined'::friend_request_status
      END,
      "created_at",
      "updated_at"
    FROM "friendships"
    ON CONFLICT DO NOTHING;

    -- 4. Remove non-accepted rows — only accepted ones become active friendships
    DELETE FROM "friendships" WHERE "status"::text != 'accepted';

    -- 5. Drop requester_id (no longer needed on the canonical table)
    ALTER TABLE "friendships" DROP COLUMN "requester_id";

    -- 6. Replace status column: friendship_status → friendship_state
    --    All remaining rows are 'accepted', so they become 'active'.
    ALTER TABLE "friendships" ADD COLUMN "status_new" "friendship_state" NOT NULL DEFAULT 'active';
    ALTER TABLE "friendships" DROP COLUMN "status";
    ALTER TABLE "friendships" RENAME COLUMN "status_new" TO "status";

    -- 7. Add unique pair constraint (user_a_id, user_b_id)
    ALTER TABLE "friendships" ADD CONSTRAINT "friendships_pair_unique"
      UNIQUE ("user_a_id", "user_b_id");

    -- 8. Drop the old enum (column is gone, so no dependency remains)
    DROP TYPE IF EXISTS "friendship_status";

  END IF;
END $$;

-- Ensure indexes exist regardless of which path the migration took
CREATE INDEX IF NOT EXISTS "friendships_user_a_idx" ON "friendships" ("user_a_id");
CREATE INDEX IF NOT EXISTS "friendships_user_b_idx" ON "friendships" ("user_b_id");
