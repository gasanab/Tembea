-- Reconcile the checked-in migration history with the current commerce schema.
--
-- Earlier development databases received these models through `prisma db push`,
-- while a database created only from migrations has none of them. Every DDL
-- operation below is therefore additive/idempotent. No table is dropped and no
-- existing business row is rewritten.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'VehicleType'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
  ) THEN
    CREATE TYPE "VehicleType" AS ENUM ('CAR', 'BUS', 'VAN', 'MOTORBIKE', 'MINIBUS', 'TRUCK');
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'PayoutStatus'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
  ) THEN
    CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'REJECTED');
  END IF;
END $$;

ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CONFIRMED' AFTER 'PENDING';

CREATE TABLE IF NOT EXISTS "rooms" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "capacity" INTEGER NOT NULL DEFAULT 1,
  "price" DOUBLE PRECISION NOT NULL,
  "images" TEXT[] NOT NULL,
  "amenities" TEXT[] NOT NULL,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "totalRooms" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "event_ticket_categories" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "totalSeats" INTEGER NOT NULL,
  "soldSeats" INTEGER NOT NULL DEFAULT 0,
  "color" TEXT,
  "perks" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_ticket_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "sold" INTEGER NOT NULL DEFAULT 0,
  "images" TEXT[] NOT NULL,
  "category" TEXT,
  "sku" TEXT,
  "weight" DOUBLE PRECISION,
  "tags" TEXT[] NOT NULL,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" TEXT NOT NULL,
  "clientReference" TEXT,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "deliveryAddress" TEXT,
  "deliveryNotes" TEXT,
  "deliveryAgent" TEXT,
  "trackingNumber" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "vehicles" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "make" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "year" INTEGER,
  "type" "VehicleType" NOT NULL DEFAULT 'CAR',
  "capacity" INTEGER NOT NULL DEFAULT 4,
  "plateNumber" TEXT,
  "color" TEXT,
  "transmission" TEXT NOT NULL DEFAULT 'automatic',
  "fuelType" TEXT NOT NULL DEFAULT 'petrol',
  "features" TEXT[] NOT NULL,
  "pricePerDay" DOUBLE PRECISION NOT NULL,
  "driverAvailable" BOOLEAN NOT NULL DEFAULT false,
  "driverName" TEXT,
  "driverPhone" TEXT,
  "driverLicense" TEXT,
  "images" TEXT[] NOT NULL,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "guide_profiles" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "bio" TEXT,
  "languages" TEXT[] NOT NULL,
  "certifications" TEXT[] NOT NULL,
  "yearsExperience" INTEGER,
  "specialties" TEXT[] NOT NULL,
  "availability" TEXT[] NOT NULL,
  "responseTime" TEXT NOT NULL DEFAULT 'within 24 hours',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "guide_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tour_packages" (
  "id" TEXT NOT NULL,
  "guideId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "duration" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "maxGuests" INTEGER NOT NULL DEFAULT 10,
  "includes" TEXT[] NOT NULL,
  "excludes" TEXT[] NOT NULL,
  "itinerary" TEXT,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tour_packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "experience_details" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "entryFee" DOUBLE PRECISION,
  "openingTime" TEXT,
  "closingTime" TEXT,
  "closedDays" TEXT[] NOT NULL,
  "packages" TEXT[] NOT NULL,
  "highlights" TEXT[] NOT NULL,
  "ageLimit" TEXT,
  "maxGroupSize" INTEGER,
  "guidedTours" BOOLEAN NOT NULL DEFAULT false,
  "bookingRequired" BOOLEAN NOT NULL DEFAULT true,
  "facilities" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "experience_details_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payout_requests" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "bankName" TEXT,
  "accountName" TEXT,
  "accountNumber" TEXT,
  "mobileNumber" TEXT,
  "method" TEXT NOT NULL DEFAULT 'bank',
  "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- Columns introduced after the tables first appeared through db push.
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "clientReference" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "roomId" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "ticketCategoryId" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "vehicleId" TEXT;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "clientReference" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';

ALTER TABLE "payments" ALTER COLUMN "bookingId" DROP NOT NULL;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "checkoutUrl" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "webhookProcessedAt" TIMESTAMP(3);

-- Optional payment targets must remain valid when a target is deleted.
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_bookingId_fkey";
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_orderId_fkey";
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Unique retry and provider identities make creation/webhook processing replay-safe.
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_clientReference_key"
  ON "bookings"("clientReference");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_clientReference_key"
  ON "orders"("clientReference");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_orderId_key"
  ON "payments"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_provider_providerRef_key"
  ON "payments"("provider", "providerRef");

CREATE UNIQUE INDEX IF NOT EXISTS "guide_profiles_listingId_key"
  ON "guide_profiles"("listingId");
CREATE UNIQUE INDEX IF NOT EXISTS "experience_details_listingId_key"
  ON "experience_details"("listingId");

CREATE INDEX IF NOT EXISTS "bookings_userId_createdAt_idx"
  ON "bookings"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "bookings_listingId_status_createdAt_idx"
  ON "bookings"("listingId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "bookings_status_createdAt_idx"
  ON "bookings"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "payments_status_paidAt_idx"
  ON "payments"("status", "paidAt");
CREATE INDEX IF NOT EXISTS "payments_currency_status_idx"
  ON "payments"("currency", "status");
CREATE INDEX IF NOT EXISTS "rooms_listingId_available_idx"
  ON "rooms"("listingId", "available");
CREATE INDEX IF NOT EXISTS "event_ticket_categories_listingId_idx"
  ON "event_ticket_categories"("listingId");
CREATE INDEX IF NOT EXISTS "products_listingId_featured_idx"
  ON "products"("listingId", "featured");
CREATE INDEX IF NOT EXISTS "orders_userId_createdAt_idx"
  ON "orders"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "orders_productId_status_createdAt_idx"
  ON "orders"("productId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "orders_status_createdAt_idx"
  ON "orders"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "vehicles_listingId_available_idx"
  ON "vehicles"("listingId", "available");
CREATE INDEX IF NOT EXISTS "payout_requests_partnerId_currency_status_createdAt_idx"
  ON "payout_requests"("partnerId", "currency", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "payout_requests_status_createdAt_idx"
  ON "payout_requests"("status", "createdAt");

-- Constraints are added conditionally because existing db-pushed databases
-- already have them under Prisma's conventional names.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rooms_listingId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "rooms" ADD CONSTRAINT "rooms_listingId_fkey"
      FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_ticket_categories_listingId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "event_ticket_categories" ADD CONSTRAINT "event_ticket_categories_listingId_fkey"
      FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_listingId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "products" ADD CONSTRAINT "products_listingId_fkey"
      FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_userId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_productId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_listingId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_listingId_fkey"
      FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'guide_profiles_listingId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "guide_profiles" ADD CONSTRAINT "guide_profiles_listingId_fkey"
      FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tour_packages_guideId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "tour_packages" ADD CONSTRAINT "tour_packages_guideId_fkey"
      FOREIGN KEY ("guideId") REFERENCES "guide_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'experience_details_listingId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "experience_details" ADD CONSTRAINT "experience_details_listingId_fkey"
      FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payout_requests_partnerId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_partnerId_fkey"
      FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payout_requests_userId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_roomId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey"
      FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_ticketCategoryId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ticketCategoryId_fkey"
      FOREIGN KEY ("ticketCategoryId") REFERENCES "event_ticket_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_vehicleId_fkey' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicleId_fkey"
      FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Database-level guardrails for newly written rows. NOT VALID preserves an
-- upgrade path if a legacy database contains bad rows; PostgreSQL still checks
-- every insert/update performed after this migration.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_exactly_one_target_check' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "payments" ADD CONSTRAINT "payments_exactly_one_target_check"
      CHECK (num_nonnulls("bookingId", "orderId") = 1) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_positive_quantity_check' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_positive_quantity_check"
      CHECK ("quantity" > 0 AND "amount" >= 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_nonnegative_inventory_check' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "products" ADD CONSTRAINT "products_nonnegative_inventory_check"
      CHECK ("stock" >= 0 AND "sold" >= 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payout_requests_positive_amount_check' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) THEN
    ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_positive_amount_check"
      CHECK ("amount" > 0) NOT VALID;
  END IF;
END $$;
