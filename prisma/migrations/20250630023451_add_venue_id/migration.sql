-- 1. Create Venue table
CREATE TABLE IF NOT EXISTS "Venue" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL
);

-- 2. Add venueId column as nullable first
ALTER TABLE "Show" ADD COLUMN "venueId" TEXT;

-- 3. Seed venues
INSERT INTO "Venue" ("id", "name", "city") VALUES
  ('venue-1', 'The Echo', 'Los Angeles'),
  ('venue-2', 'Elsewhere', 'Brooklyn'),
  ('venue-3', 'The Roxy', 'Los Angeles');

-- 4. Backfill venueId in Show based on old string column
UPDATE "Show" SET "venueId" = 'venue-1' WHERE "venue" = 'The Echo';
UPDATE "Show" SET "venueId" = 'venue-2' WHERE "venue" = 'Elsewhere';
UPDATE "Show" SET "venueId" = 'venue-3' WHERE "venue" = 'The Roxy';

-- 5. Make venueId required
ALTER TABLE "Show" ALTER COLUMN "venueId" SET NOT NULL;

-- 6. Add FK constraint
ALTER TABLE "Show"
ADD CONSTRAINT "Show_venueId_fkey"
FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Drop old string column
ALTER TABLE "Show" DROP COLUMN "venue";
