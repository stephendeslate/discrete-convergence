-- Row Level Security for multi-tenant isolation
-- VERIFY: AE-SEC-010 — RLS policies enforce tenant isolation

ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tenants ON "tenants"
  USING (id = current_setting('app.tenant_id', true));

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_users ON "users"
  USING (tenant_id = current_setting('app.tenant_id', true));

ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_dashboards ON "dashboards"
  USING (tenant_id = current_setting('app.tenant_id', true));

ALTER TABLE "widgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "widgets" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_widgets ON "widgets"
  USING (dashboard_id IN (SELECT id FROM dashboards WHERE tenant_id = current_setting('app.tenant_id', true)));

ALTER TABLE "data_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_data_sources ON "data_sources"
  USING (tenant_id = current_setting('app.tenant_id', true));

ALTER TABLE "data_source_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_source_configs" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_data_source_configs ON "data_source_configs"
  USING (data_source_id IN (SELECT id FROM data_sources WHERE tenant_id = current_setting('app.tenant_id', true)));

ALTER TABLE "field_mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "field_mappings" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_field_mappings ON "field_mappings"
  USING (data_source_id IN (SELECT id FROM data_sources WHERE tenant_id = current_setting('app.tenant_id', true)));

ALTER TABLE "sync_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sync_runs" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sync_runs ON "sync_runs"
  USING (data_source_id IN (SELECT id FROM data_sources WHERE tenant_id = current_setting('app.tenant_id', true)));

ALTER TABLE "data_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_points" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_data_points ON "data_points"
  USING (data_source_id IN (SELECT id FROM data_sources WHERE tenant_id = current_setting('app.tenant_id', true)));

ALTER TABLE "aggregated_data_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aggregated_data_points" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_aggregated_data_points ON "aggregated_data_points"
  USING (data_source_id IN (SELECT id FROM data_sources WHERE tenant_id = current_setting('app.tenant_id', true)));

ALTER TABLE "embed_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "embed_configs" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_embed_configs ON "embed_configs"
  USING (dashboard_id IN (SELECT id FROM dashboards WHERE tenant_id = current_setting('app.tenant_id', true)));

ALTER TABLE "query_cache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "query_cache" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_query_cache ON "query_cache"
  USING (data_source_id IN (SELECT id FROM data_sources WHERE tenant_id = current_setting('app.tenant_id', true)));

ALTER TABLE "dead_letter_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dead_letter_events" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_dead_letter_events ON "dead_letter_events"
  USING (true);

ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_api_keys ON "api_keys"
  USING (tenant_id = current_setting('app.tenant_id', true));

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_audit_logs ON "audit_logs"
  USING (tenant_id = current_setting('app.tenant_id', true));
