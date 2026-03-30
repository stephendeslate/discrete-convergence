-- Add INSERT policies for multi-tenant RLS (SELECT policies already exist from init migration)

-- Add INSERT policies for all tenant-scoped tables
CREATE POLICY "vehicles_tenant_insert" ON "vehicles"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

CREATE POLICY "drivers_tenant_insert" ON "drivers"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

CREATE POLICY "routes_tenant_insert" ON "routes"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

CREATE POLICY "dispatches_tenant_insert" ON "dispatches"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

CREATE POLICY "maintenance_tenant_insert" ON "maintenance"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

CREATE POLICY "trips_tenant_insert" ON "trips"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

CREATE POLICY "zones_tenant_insert" ON "zones"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

CREATE POLICY "users_tenant_insert" ON "users"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

CREATE POLICY "audit_logs_tenant_insert" ON "audit_logs"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "vehicles_status_idx" ON "vehicles"("status");
CREATE INDEX IF NOT EXISTS "vehicles_tenant_status_idx" ON "vehicles"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "drivers_status_idx" ON "drivers"("status");
CREATE INDEX IF NOT EXISTS "drivers_tenant_status_idx" ON "drivers"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "dispatches_status_idx" ON "dispatches"("status");
CREATE INDEX IF NOT EXISTS "dispatches_tenant_status_idx" ON "dispatches"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "dispatches_vehicle_status_idx" ON "dispatches"("vehicle_id", "status");
CREATE INDEX IF NOT EXISTS "maintenance_status_idx" ON "maintenance"("status");
CREATE INDEX IF NOT EXISTS "maintenance_tenant_status_idx" ON "maintenance"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "trips_status_idx" ON "trips"("status");
CREATE INDEX IF NOT EXISTS "trips_tenant_status_idx" ON "trips"("tenant_id", "status");
