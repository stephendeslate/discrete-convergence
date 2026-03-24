-- TRACED:AE-MIG-001 — Initial migration with RLS enforcement

-- Enable Row Level Security on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards FORCE ROW LEVEL SECURITY;

ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets FORCE ROW LEVEL SECURITY;

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources FORCE ROW LEVEL SECURITY;

ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings FORCE ROW LEVEL SECURITY;

ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs FORCE ROW LEVEL SECURITY;

ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points FORCE ROW LEVEL SECURITY;

ALTER TABLE aggregated_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_data_points FORCE ROW LEVEL SECURITY;

ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE query_caches ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_caches FORCE ROW LEVEL SECURITY;

ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_events FORCE ROW LEVEL SECURITY;

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON users
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON dashboards
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON widgets
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON data_sources
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON sync_runs
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON data_points
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON aggregated_data_points
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON embed_configs
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON query_caches
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON dead_letter_events
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON api_keys
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON audit_logs
  USING ("tenantId" = current_setting('app.current_tenant_id', true));
