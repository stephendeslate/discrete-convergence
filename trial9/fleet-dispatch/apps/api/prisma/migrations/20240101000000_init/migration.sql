-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'driver', 'dispatcher', 'viewer');

-- CreateEnum
CREATE TYPE "vehicle_status" AS ENUM ('available', 'in_use', 'maintenance', 'retired');

-- CreateEnum
CREATE TYPE "driver_status" AS ENUM ('available', 'on_duty', 'off_duty', 'suspended');

-- CreateEnum
CREATE TYPE "dispatch_status" AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "maintenance_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'viewer',
    "tenantId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "vehicle_status" NOT NULL DEFAULT 'available',
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "fuel_capacity" DECIMAL(12,2) NOT NULL,
    "cost_per_mile" DECIMAL(12,2) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "status" "driver_status" NOT NULL DEFAULT 'available',
    "hourly_rate" DECIMAL(12,2) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "distance_miles" DECIMAL(12,2) NOT NULL,
    "estimated_time" INTEGER NOT NULL,
    "tenantId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatches" (
    "id" TEXT NOT NULL,
    "status" "dispatch_status" NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "total_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "maintenance_status" NOT NULL DEFAULT 'scheduled',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vehicleId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "users_email_idx" ON "users"("email");

CREATE INDEX "vehicles_tenantId_idx" ON "vehicles"("tenantId");
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");
CREATE INDEX "vehicles_tenantId_status_idx" ON "vehicles"("tenantId", "status");

CREATE INDEX "drivers_tenantId_idx" ON "drivers"("tenantId");
CREATE INDEX "drivers_status_idx" ON "drivers"("status");
CREATE INDEX "drivers_tenantId_status_idx" ON "drivers"("tenantId", "status");

CREATE INDEX "routes_tenantId_idx" ON "routes"("tenantId");

CREATE INDEX "dispatches_tenantId_idx" ON "dispatches"("tenantId");
CREATE INDEX "dispatches_status_idx" ON "dispatches"("status");
CREATE INDEX "dispatches_tenantId_status_idx" ON "dispatches"("tenantId", "status");
CREATE INDEX "dispatches_vehicleId_idx" ON "dispatches"("vehicleId");
CREATE INDEX "dispatches_driverId_idx" ON "dispatches"("driverId");
CREATE INDEX "dispatches_routeId_idx" ON "dispatches"("routeId");

CREATE INDEX "maintenances_tenantId_idx" ON "maintenances"("tenantId");
CREATE INDEX "maintenances_status_idx" ON "maintenances"("status");
CREATE INDEX "maintenances_tenantId_status_idx" ON "maintenances"("tenantId", "status");
CREATE INDEX "maintenances_vehicleId_idx" ON "maintenances"("vehicleId");

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security
SET LOCAL app.current_tenant_id = '00000000-0000-0000-0000-000000000000';

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_users" ON "users"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_vehicles" ON "vehicles"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drivers" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_drivers" ON "drivers"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_routes" ON "routes"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "dispatches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispatches" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_dispatches" ON "dispatches"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "maintenances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "maintenances" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_maintenances" ON "maintenances"
  USING ("tenantId" = current_setting('app.current_tenant_id'));
