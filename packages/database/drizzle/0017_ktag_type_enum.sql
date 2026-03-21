DO $$
BEGIN
  CREATE TYPE "ktag_type" AS ENUM ('WALL', 'MOBILE', 'DESK');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE "ktags"
ALTER COLUMN "tag_type" TYPE "ktag_type"
USING (
  CASE
    WHEN "tag_type" IS NULL THEN NULL
    WHEN upper("tag_type") IN ('WALL', 'MOBILE', 'DESK') THEN upper("tag_type")::"ktag_type"
    ELSE NULL
  END
);
