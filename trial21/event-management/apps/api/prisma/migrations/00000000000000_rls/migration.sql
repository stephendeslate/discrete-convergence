-- Row-Level Security for multi-tenant isolation — TRACED:EM-SEC-004
-- tenant_id is TEXT, no ::uuid cast per CED v1.9

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON organizations
  USING (id = current_setting('app.tenant_id', true));

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY user_isolation ON users
  USING (organization_id = current_setting('app.tenant_id', true));

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;
CREATE POLICY event_isolation ON events
  USING (organization_id = current_setting('app.tenant_id', true));

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues FORCE ROW LEVEL SECURITY;
CREATE POLICY venue_isolation ON venues
  USING (organization_id = current_setting('app.tenant_id', true));

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_isolation ON audit_logs
  USING (organization_id = current_setting('app.tenant_id', true));
