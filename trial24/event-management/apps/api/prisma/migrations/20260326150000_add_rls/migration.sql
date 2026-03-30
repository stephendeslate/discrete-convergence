-- Enable RLS for tenant isolation (idempotent)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" FORCE ROW LEVEL SECURITY;

ALTER TABLE "venues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venues" FORCE ROW LEVEL SECURITY;

ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" FORCE ROW LEVEL SECURITY;

ALTER TABLE "speakers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "speakers" FORCE ROW LEVEL SECURITY;

ALTER TABLE "sponsors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sponsors" FORCE ROW LEVEL SECURITY;

ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tickets" FORCE ROW LEVEL SECURITY;

ALTER TABLE "attendees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendees" FORCE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation ON "users" USING ("organization_id" = current_setting('app.organization_id')::uuid);
CREATE POLICY tenant_isolation ON "events" USING ("organization_id" = current_setting('app.organization_id')::uuid);
CREATE POLICY tenant_isolation ON "venues" USING ("organization_id" = current_setting('app.organization_id')::uuid);
CREATE POLICY tenant_isolation ON "sessions" USING ("organization_id" = current_setting('app.organization_id')::uuid);
CREATE POLICY tenant_isolation ON "speakers" USING ("organization_id" = current_setting('app.organization_id')::uuid);
CREATE POLICY tenant_isolation ON "sponsors" USING ("organization_id" = current_setting('app.organization_id')::uuid);
CREATE POLICY tenant_isolation ON "tickets" USING ("organization_id" = current_setting('app.organization_id')::uuid);
CREATE POLICY tenant_isolation ON "attendees" USING ("organization_id" = current_setting('app.organization_id')::uuid);
