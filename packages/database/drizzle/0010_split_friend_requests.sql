-- New enums for the two-table model
CREATE TYPE "friendship_state" AS ENUM ('active', 'removed');
CREATE TYPE "friend_request_status" AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

-- New friendships table (canonical, soft-deleted, unique pair)
CREATE TABLE "friendships_new" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_a_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "user_b_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "status" "friendship_state" NOT NULL DEFAULT 'active',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  CONSTRAINT "friendships_pair_unique" UNIQUE ("user_a_id", "user_b_id")
);

-- Friend requests audit log (directional, one row per request)
CREATE TABLE "friend_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "from_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "to_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "status" "friend_request_status" NOT NULL DEFAULT 'pending',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- Migrate accepted rows → new friendships (user_a_id/user_b_id already canonical in old table)
INSERT INTO "friendships_new" ("user_a_id", "user_b_id", "status", "created_at", "updated_at")
SELECT "user_a_id", "user_b_id", 'active', "created_at", "updated_at"
FROM "friendships"
WHERE "status" = 'accepted'
ON CONFLICT ("user_a_id", "user_b_id") DO NOTHING;

-- Migrate pending rows → friend_requests (requester_id = from_id, other party = to_id)
INSERT INTO "friend_requests" ("from_id", "to_id", "status", "created_at", "updated_at")
SELECT
  "requester_id",
  CASE WHEN "user_a_id" = "requester_id" THEN "user_b_id" ELSE "user_a_id" END,
  'pending',
  "created_at",
  "updated_at"
FROM "friendships"
WHERE "status" = 'pending';

-- Migrate blocked rows → declined friend_requests (requester tried, got blocked = declined)
INSERT INTO "friend_requests" ("from_id", "to_id", "status", "created_at", "updated_at")
SELECT
  "requester_id",
  CASE WHEN "user_a_id" = "requester_id" THEN "user_b_id" ELSE "user_a_id" END,
  'declined',
  "created_at",
  "updated_at"
FROM "friendships"
WHERE "status" = 'blocked';

-- Drop old table and enum
DROP TABLE "friendships";
DROP TYPE "friendship_status";

-- Rename new table into place
ALTER TABLE "friendships_new" RENAME TO "friendships";
ALTER INDEX "friendships_pair_unique" RENAME TO "friendships_pair_unique_idx";

-- Recreate indexes on final table name
CREATE INDEX "friendships_user_a_idx" ON "friendships" ("user_a_id");
CREATE INDEX "friendships_user_b_idx" ON "friendships" ("user_b_id");
CREATE INDEX "friend_requests_from_idx" ON "friend_requests" ("from_id");
CREATE INDEX "friend_requests_to_idx" ON "friend_requests" ("to_id");
