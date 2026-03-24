-- TRACED:FD-MIG-001
-- Initial migration with RLS policies

-- Enable RLS on tenant-scoped tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" FORCE ROW LEVEL SECURITY;

ALTER TABLE "technicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technicians" FORCE ROW LEVEL SECURITY;

ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" FORCE ROW LEVEL SECURITY;

ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" FORCE ROW LEVEL SECURITY;

ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" FORCE ROW LEVEL SECURITY;

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;

-- RLS policies for tenant isolation
CREATE POLICY tenant_isolation_users ON "users"
  USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY tenant_isolation_work_orders ON "work_orders"
  USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY tenant_isolation_technicians ON "technicians"
  USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY tenant_isolation_customers ON "customers"
  USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY tenant_isolation_routes ON "routes"
  USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY tenant_isolation_invoices ON "invoices"
  USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY tenant_isolation_audit_logs ON "audit_logs"
  USING (company_id = current_setting('app.current_company_id', true));
