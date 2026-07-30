-- Persist normalized reservation windows and inventory units so availability
-- can be enforced transactionally instead of being inferred from JSON.
-- Columns remain nullable for legacy bookings created before this migration;
-- the application requires them for every newly created booking.

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "startAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "endAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "units" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "holdExpiresAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "tourPackageId" TEXT;

-- Preserve package selections that were previously stored only in bookingData.
UPDATE "bookings" AS booking
SET "tourPackageId" = booking."bookingData"->>'tourPackageId'
FROM "tour_packages" AS package
WHERE booking."tourPackageId" IS NULL
  AND booking."bookingData"->>'tourPackageId' = package."id";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_tourPackageId_fkey'
      AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
  ) THEN
    ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_tourPackageId_fkey"
      FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_positive_units_check'
      AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
  ) THEN
    ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_positive_units_check"
      CHECK ("units" > 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_reservation_window_check'
      AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
  ) THEN
    ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_reservation_window_check"
      CHECK (
        ("startAt" IS NULL AND "endAt" IS NULL)
        OR
        ("startAt" IS NOT NULL AND "endAt" IS NOT NULL AND "endAt" > "startAt")
      ) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "bookings_listingId_status_startAt_endAt_idx"
  ON "bookings"("listingId", "status", "startAt", "endAt");
CREATE INDEX IF NOT EXISTS "bookings_roomId_status_startAt_endAt_idx"
  ON "bookings"("roomId", "status", "startAt", "endAt");
CREATE INDEX IF NOT EXISTS "bookings_ticketCategoryId_status_idx"
  ON "bookings"("ticketCategoryId", "status");
CREATE INDEX IF NOT EXISTS "bookings_vehicleId_status_startAt_endAt_idx"
  ON "bookings"("vehicleId", "status", "startAt", "endAt");
CREATE INDEX IF NOT EXISTS "bookings_tourPackageId_status_startAt_endAt_idx"
  ON "bookings"("tourPackageId", "status", "startAt", "endAt");
CREATE INDEX IF NOT EXISTS "bookings_status_holdExpiresAt_idx"
  ON "bookings"("status", "holdExpiresAt");
