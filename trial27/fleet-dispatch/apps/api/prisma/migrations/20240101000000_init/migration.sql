-- RLS policies for all tenanted tables

-- CreateEnum
CREATE TYPE "tenant_tier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "vehicle_type" AS ENUM ('TRUCK', 'VAN', 'CAR', 'MOTORCYCLE');
CREATE TYPE "vehicle_status" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED');
CREATE TYPE "driver_status" AS ENUM ('AVAILABLE', 'ON_DUTY', 'OFF_DUTY');
CREATE TYPE "job_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable: tenants
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" "tenant_tier" NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_tenant_id_role_idx" ON "users"("tenant_id", "role");
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: vehicles
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "type" "vehicle_type" NOT NULL DEFAULT 'CAR',
    "status" "vehicle_status" NOT NULL DEFAULT 'AVAILABLE',
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "vehicles_tenant_id_license_plate_key" ON "vehicles"("tenant_id", "license_plate");
CREATE INDEX "vehicles_tenant_id_idx" ON "vehicles"("tenant_id");
CREATE INDEX "vehicles_tenant_id_status_idx" ON "vehicles"("tenant_id", "status");
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: drivers
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "status" "driver_status" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "drivers_tenant_id_email_key" ON "drivers"("tenant_id", "email");
CREATE UNIQUE INDEX "drivers_tenant_id_license_number_key" ON "drivers"("tenant_id", "license_number");
CREATE INDEX "drivers_tenant_id_idx" ON "drivers"("tenant_id");
CREATE INDEX "drivers_tenant_id_status_idx" ON "drivers"("tenant_id", "status");
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: dispatch_jobs
CREATE TABLE "dispatch_jobs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "driver_id" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "job_status" NOT NULL DEFAULT 'PENDING',
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dispatch_jobs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "dispatch_jobs_tenant_id_idx" ON "dispatch_jobs"("tenant_id");
CREATE INDEX "dispatch_jobs_tenant_id_status_idx" ON "dispatch_jobs"("tenant_id", "status");
CREATE INDEX "dispatch_jobs_vehicle_id_idx" ON "dispatch_jobs"("vehicle_id");
CREATE INDEX "dispatch_jobs_driver_id_idx" ON "dispatch_jobs"("driver_id");
ALTER TABLE "dispatch_jobs" ADD CONSTRAINT "dispatch_jobs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatch_jobs" ADD CONSTRAINT "dispatch_jobs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dispatch_jobs" ADD CONSTRAINT "dispatch_jobs_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: maintenance_logs
CREATE TABLE "maintenance_logs" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "maintenance_logs_vehicle_id_idx" ON "maintenance_logs"("vehicle_id");
CREATE INDEX "maintenance_logs_tenant_id_idx" ON "maintenance_logs"("tenant_id");
CREATE INDEX "maintenance_logs_tenant_id_vehicle_id_idx" ON "maintenance_logs"("tenant_id", "vehicle_id");
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "user_id" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");
CREATE INDEX "audit_logs_tenant_id_entity_idx" ON "audit_logs"("tenant_id", "entity");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Row-Level Security ─────────────────────────────────────────────────────────

-- Users RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "users_tenant_isolation" ON "users"
  USING ("tenant_id" = current_setting('app.current_tenant_id', TRUE));

-- Vehicles RLS
ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_tenant_isolation" ON "vehicles"
  USING ("tenant_id" = current_setting('app.current_tenant_id', TRUE));

-- Drivers RLS
ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drivers" FORCE ROW LEVEL SECURITY;
CREATE POLICY "drivers_tenant_isolation" ON "drivers"
  USING ("tenant_id" = current_setting('app.current_tenant_id', TRUE));

-- Dispatch Jobs RLS
ALTER TABLE "dispatch_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispatch_jobs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "dispatch_jobs_tenant_isolation" ON "dispatch_jobs"
  USING ("tenant_id" = current_setting('app.current_tenant_id', TRUE));

-- Maintenance Logs RLS
ALTER TABLE "maintenance_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "maintenance_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_logs_tenant_isolation" ON "maintenance_logs"
  USING ("tenant_id" = current_setting('app.current_tenant_id', TRUE));

-- Audit Logs RLS
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_tenant_isolation" ON "audit_logs"
  USING ("tenant_id" = current_setting('app.current_tenant_id', TRUE));
