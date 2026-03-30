-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'dispatcher', 'driver');
CREATE TYPE "vehicle_status" AS ENUM ('available', 'in_use', 'maintenance', 'retired');
CREATE TYPE "driver_status" AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE "dispatch_status" AS ENUM ('pending', 'in_transit', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'dispatcher',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "status" "vehicle_status" NOT NULL DEFAULT 'available',
    "mileage" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "driver_status" NOT NULL DEFAULT 'active',
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatches" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "dispatch_status" NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");

CREATE INDEX "vehicles_tenant_id_idx" ON "vehicles"("tenant_id");
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");
CREATE INDEX "vehicles_tenant_id_status_idx" ON "vehicles"("tenant_id", "status");

CREATE UNIQUE INDEX "drivers_user_id_key" ON "drivers"("user_id");
CREATE INDEX "drivers_tenant_id_idx" ON "drivers"("tenant_id");
CREATE INDEX "drivers_status_idx" ON "drivers"("status");
CREATE INDEX "drivers_tenant_id_status_idx" ON "drivers"("tenant_id", "status");

CREATE INDEX "dispatches_tenant_id_idx" ON "dispatches"("tenant_id");
CREATE INDEX "dispatches_status_idx" ON "dispatches"("status");
CREATE INDEX "dispatches_tenant_id_status_idx" ON "dispatches"("tenant_id", "status");
CREATE INDEX "dispatches_vehicle_id_idx" ON "dispatches"("vehicle_id");
CREATE INDEX "dispatches_driver_id_idx" ON "dispatches"("driver_id");

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security
SET LOCAL app.current_tenant_id = '00000000-0000-0000-0000-000000000000';

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_users" ON "users"
  USING ("tenant_id" = current_setting('app.current_tenant_id'));

ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_vehicles" ON "vehicles"
  USING ("tenant_id" = current_setting('app.current_tenant_id'));

ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drivers" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_drivers" ON "drivers"
  USING ("tenant_id" = current_setting('app.current_tenant_id'));

ALTER TABLE "dispatches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispatches" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_dispatches" ON "dispatches"
  USING ("tenant_id" = current_setting('app.current_tenant_id'));
