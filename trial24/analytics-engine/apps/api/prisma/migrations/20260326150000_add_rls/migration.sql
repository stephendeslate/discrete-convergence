-- Enable RLS for tenant isolation (idempotent)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" FORCE ROW LEVEL SECURITY;

ALTER TABLE "widgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "widgets" FORCE ROW LEVEL SECURITY;

ALTER TABLE "data_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" FORCE ROW LEVEL SECURITY;

ALTER TABLE "sync_histories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sync_histories" FORCE ROW LEVEL SECURITY;

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation ON "users" USING ("tenant_id" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON "dashboards" USING ("tenant_id" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON "widgets" USING ("tenant_id" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON "data_sources" USING ("tenant_id" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON "sync_histories" USING ("tenant_id" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON "audit_logs" USING ("tenant_id" = current_setting('app.tenant_id')::uuid);
