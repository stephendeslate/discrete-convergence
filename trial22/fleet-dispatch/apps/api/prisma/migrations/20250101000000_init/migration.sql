-- TRACED: FD-INFRA-003
-- TRACED: FD-DATA-006
-- TRACED: FD-DATA-007
-- TRACED: FD-DATA-008
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user', 'driver', 'dispatcher');
CREATE TYPE "vehicle_status" AS ENUM ('active', 'maintenance', 'inactive', 'retired');
CREATE TYPE "driver_status" AS ENUM ('available', 'on_trip', 'off_duty', 'suspended');
CREATE TYPE "route_status" AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE "trip_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "dispatch_status" AS ENUM ('pending', 'assigned', 'in_transit', 'delivered', 'failed');
CREATE TYPE "alert_severity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable: tenants
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- TRACED: FD-DATA-002
-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");

-- TRACED: FD-DATA-003
-- CreateTable: vehicles
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vin" VARCHAR(17) NOT NULL,
    "license_plate" VARCHAR(20) NOT NULL,
    "make" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "vehicle_status" NOT NULL DEFAULT 'active',
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "vehicles_tenant_id_idx" ON "vehicles"("tenant_id");
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");
CREATE INDEX "vehicles_tenant_id_status_idx" ON "vehicles"("tenant_id", "status");

-- TRACED: FD-DATA-004
-- CreateTable: drivers
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "license_number" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "status" "driver_status" NOT NULL DEFAULT 'available',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "drivers_tenant_id_idx" ON "drivers"("tenant_id");
CREATE INDEX "drivers_status_idx" ON "drivers"("status");
CREATE INDEX "drivers_tenant_id_status_idx" ON "drivers"("tenant_id", "status");

-- CreateTable: routes
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "route_status" NOT NULL DEFAULT 'draft',
    "distance" DECIMAL(10,2) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "routes_tenant_id_idx" ON "routes"("tenant_id");
CREATE INDEX "routes_status_idx" ON "routes"("status");
CREATE INDEX "routes_tenant_id_status_idx" ON "routes"("tenant_id", "status");

-- CreateTable: trips
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "status" "trip_status" NOT NULL DEFAULT 'scheduled',
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trips_tenant_id_idx" ON "trips"("tenant_id");
CREATE INDEX "trips_status_idx" ON "trips"("status");
CREATE INDEX "trips_tenant_id_status_idx" ON "trips"("tenant_id", "status");

-- CreateTable: stops
CREATE TABLE "stops" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "sequence" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "stops_tenant_id_idx" ON "stops"("tenant_id");
CREATE INDEX "stops_route_id_idx" ON "stops"("route_id");

-- CreateTable: dispatches
CREATE TABLE "dispatches" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "status" "dispatch_status" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dispatches_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "dispatches_tenant_id_idx" ON "dispatches"("tenant_id");
CREATE INDEX "dispatches_status_idx" ON "dispatches"("status");
CREATE INDEX "dispatches_tenant_id_status_idx" ON "dispatches"("tenant_id", "status");

-- CreateTable: maintenance_records
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "maintenance_records_tenant_id_idx" ON "maintenance_records"("tenant_id");
CREATE INDEX "maintenance_records_vehicle_id_idx" ON "maintenance_records"("vehicle_id");

-- CreateTable: fuel_logs
CREATE TABLE "fuel_logs" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "gallons" DECIMAL(8,3) NOT NULL,
    "cost_per_unit" DECIMAL(12,2) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "mileage" INTEGER NOT NULL,
    "filled_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "fuel_logs_tenant_id_idx" ON "fuel_logs"("tenant_id");
CREATE INDEX "fuel_logs_vehicle_id_idx" ON "fuel_logs"("vehicle_id");

-- CreateTable: geofences
CREATE TABLE "geofences" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "radius" DECIMAL(10,2) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "geofences_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "geofences_tenant_id_idx" ON "geofences"("tenant_id");

-- CreateTable: alerts
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "alert_severity" NOT NULL DEFAULT 'low',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "alerts_tenant_id_idx" ON "alerts"("tenant_id");
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");
CREATE INDEX "alerts_tenant_id_severity_idx" ON "alerts"("tenant_id", "severity");

-- CreateTable: notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_tenant_id_idx" ON "notifications"("tenant_id");
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- TRACED: FD-DATA-005
-- CreateTable: audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(36) NOT NULL,
    "details" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_tenant_id_entity_idx" ON "audit_logs"("tenant_id", "entity");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "routes" ADD CONSTRAINT "routes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stops" ADD CONSTRAINT "stops_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stops" ADD CONSTRAINT "stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "geofences" ADD CONSTRAINT "geofences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security
-- VERIFY: FD-SEC-RLS-001 — RLS enabled and forced on all tenant-scoped tables

ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_tenants" ON "tenants"
  USING ("id" = current_setting('app.tenant_id', true));

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_users" ON "users"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_vehicles" ON "vehicles"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drivers" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_drivers" ON "drivers"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_routes" ON "routes"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trips" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_trips" ON "trips"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "stops" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stops" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_stops" ON "stops"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "dispatches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispatches" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_dispatches" ON "dispatches"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "maintenance_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "maintenance_records" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_maintenance_records" ON "maintenance_records"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "fuel_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fuel_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_fuel_logs" ON "fuel_logs"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "geofences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "geofences" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_geofences" ON "geofences"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "alerts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alerts" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_alerts" ON "alerts"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_notifications" ON "notifications"
  USING ("tenant_id" = current_setting('app.tenant_id', true));

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_audit_logs" ON "audit_logs"
  USING ("tenant_id" = current_setting('app.tenant_id', true));
