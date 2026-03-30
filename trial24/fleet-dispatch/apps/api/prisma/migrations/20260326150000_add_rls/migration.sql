-- Enable RLS for tenant isolation (idempotent)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY;

ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drivers" FORCE ROW LEVEL SECURITY;

ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" FORCE ROW LEVEL SECURITY;

ALTER TABLE "dispatches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispatches" FORCE ROW LEVEL SECURITY;

ALTER TABLE "trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trips" FORCE ROW LEVEL SECURITY;

ALTER TABLE "maintenance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "maintenance" FORCE ROW LEVEL SECURITY;

ALTER TABLE "zones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "zones" FORCE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation ON "users" USING ("company_id" = current_setting('app.company_id'));
CREATE POLICY tenant_isolation ON "vehicles" USING ("company_id" = current_setting('app.company_id'));
CREATE POLICY tenant_isolation ON "drivers" USING ("company_id" = current_setting('app.company_id'));
CREATE POLICY tenant_isolation ON "routes" USING ("company_id" = current_setting('app.company_id'));
CREATE POLICY tenant_isolation ON "dispatches" USING ("company_id" = current_setting('app.company_id'));
CREATE POLICY tenant_isolation ON "trips" USING ("company_id" = current_setting('app.company_id'));
CREATE POLICY tenant_isolation ON "maintenance" USING ("company_id" = current_setting('app.company_id'));
CREATE POLICY tenant_isolation ON "zones" USING ("company_id" = current_setting('app.company_id'));
