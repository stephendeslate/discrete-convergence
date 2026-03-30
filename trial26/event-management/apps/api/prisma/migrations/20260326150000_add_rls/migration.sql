-- TRACED:EM-RLS-001 — Row-Level Security FORCE for multi-tenant isolation
-- (RLS ENABLE and basic policies are created in init migration)

-- Force RLS even for table owners (defense-in-depth)
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;
ALTER TABLE tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE venues FORCE ROW LEVEL SECURITY;
ALTER TABLE attendees FORCE ROW LEVEL SECURITY;
ALTER TABLE speakers FORCE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE sponsors FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Add status indexes for query performance
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events"("status");
CREATE INDEX IF NOT EXISTS "events_tenant_status_idx" ON "events"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "tickets_status_idx" ON "tickets"("status");
CREATE INDEX IF NOT EXISTS "tickets_tenant_status_idx" ON "tickets"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "tickets_event_status_idx" ON "tickets"("event_id", "status");
CREATE INDEX IF NOT EXISTS "sessions_status_idx" ON "sessions"("status");
CREATE INDEX IF NOT EXISTS "sessions_tenant_status_idx" ON "sessions"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "sessions_event_status_idx" ON "sessions"("event_id", "status");
