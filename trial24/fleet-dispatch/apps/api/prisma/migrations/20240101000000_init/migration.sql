-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE "vehicle_status" AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE "driver_status" AS ENUM ('available', 'on_trip', 'off_duty');
CREATE TYPE "dispatch_status" AS ENUM ('pending', 'dispatched', 'in_transit', 'completed', 'cancelled');
CREATE TYPE "maintenance_type" AS ENUM ('routine', 'repair', 'inspection');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'viewer',
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "vehicle_status" NOT NULL DEFAULT 'active',
    "license_plate" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "status" "driver_status" NOT NULL DEFAULT 'available',
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "distance_km" DECIMAL(10,2) NOT NULL,
    "estimated_minutes" INTEGER NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dispatches" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "status" "dispatch_status" NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "dispatch_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "distance_km" DECIMAL(10,2),
    "fuel_used_liters" DECIMAL(10,2),
    "notes" TEXT,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "maintenance" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "type" "maintenance_type" NOT NULL,
    "description" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "cost" DECIMAL(10,2),
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "polygon" JSONB NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_company_id_key" ON "users"("email", "company_id");
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

CREATE UNIQUE INDEX "vehicles_vin_company_id_key" ON "vehicles"("vin", "company_id");
CREATE INDEX "vehicles_company_id_idx" ON "vehicles"("company_id");

CREATE UNIQUE INDEX "drivers_email_company_id_key" ON "drivers"("email", "company_id");
CREATE INDEX "drivers_company_id_idx" ON "drivers"("company_id");

CREATE INDEX "routes_company_id_idx" ON "routes"("company_id");

CREATE INDEX "dispatches_company_id_idx" ON "dispatches"("company_id");
CREATE INDEX "dispatches_vehicle_id_idx" ON "dispatches"("vehicle_id");
CREATE INDEX "dispatches_driver_id_idx" ON "dispatches"("driver_id");
CREATE INDEX "dispatches_route_id_idx" ON "dispatches"("route_id");

CREATE INDEX "trips_company_id_idx" ON "trips"("company_id");
CREATE INDEX "trips_dispatch_id_idx" ON "trips"("dispatch_id");

CREATE INDEX "maintenance_company_id_idx" ON "maintenance"("company_id");
CREATE INDEX "maintenance_vehicle_id_idx" ON "maintenance"("vehicle_id");

CREATE INDEX "zones_company_id_idx" ON "zones"("company_id");

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_dispatch_id_fkey" FOREIGN KEY ("dispatch_id") REFERENCES "dispatches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ══════════════════════════════════════════════════════
-- Row-Level Security
-- ══════════════════════════════════════════════════════

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispatches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "maintenance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "zones" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_company_isolation" ON "users"
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY "vehicles_company_isolation" ON "vehicles"
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY "drivers_company_isolation" ON "drivers"
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY "routes_company_isolation" ON "routes"
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY "dispatches_company_isolation" ON "dispatches"
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY "trips_company_isolation" ON "trips"
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY "maintenance_company_isolation" ON "maintenance"
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY "zones_company_isolation" ON "zones"
  USING ("company_id" = current_setting('app.company_id', true));
