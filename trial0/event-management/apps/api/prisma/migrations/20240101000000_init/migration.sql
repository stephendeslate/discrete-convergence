-- TRACED:EM-MIG-001 — Initial migration with RLS enforcement

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tier organization_tier NOT NULL DEFAULT 'free',
  branding JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'attendee',
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_organization_id ON users(organization_id);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status event_status NOT NULL DEFAULT 'draft',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  capacity INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  venue_id UUID REFERENCES venues(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);
CREATE INDEX idx_events_organization_id ON events(organization_id);
CREATE INDEX idx_events_organization_status ON events(organization_id, status);

-- Venues
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  capacity INTEGER,
  is_virtual BOOLEAN NOT NULL DEFAULT false,
  virtual_url TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_venues_organization_id ON venues(organization_id);

-- Event Sessions
CREATE TABLE event_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  track TEXT,
  speaker TEXT,
  capacity INTEGER,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_event_sessions_event_id ON event_sessions(event_id);

-- Ticket Types
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_in_cents INTEGER NOT NULL,
  quota INTEGER NOT NULL,
  sold_count INTEGER NOT NULL DEFAULT 0,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ticket_types_event_id ON ticket_types(event_id);

-- Registrations
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status registration_status NOT NULL DEFAULT 'pending',
  qr_code TEXT,
  user_id UUID NOT NULL REFERENCES users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);

-- Registration Fields
CREATE TABLE registration_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  type field_type NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  options TEXT[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE
);
CREATE INDEX idx_registration_fields_event_id ON registration_fields(event_id);

-- Registration Field Values
CREATE TABLE registration_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL,
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  registration_field_id UUID NOT NULL REFERENCES registration_fields(id) ON DELETE CASCADE,
  UNIQUE(registration_id, registration_field_id)
);

-- Check-ins
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_by TEXT,
  registration_id UUID NOT NULL UNIQUE REFERENCES registrations(id)
);

-- Waitlist Entries
CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position INTEGER NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL,
  ticket_type_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_waitlist_entries_event_id ON waitlist_entries(event_id);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL,
  status notification_status NOT NULL DEFAULT 'queued',
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_event_id ON notifications(event_id);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  changes JSONB,
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_organization_created ON audit_logs(organization_id, created_at);

-- Enums
CREATE TYPE organization_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'attendee');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'archived', 'cancelled');
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlisted', 'promoted', 'checked_in');
CREATE TYPE field_type AS ENUM ('text', 'email', 'phone', 'select', 'checkbox');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'failed', 'delivered');
CREATE TYPE notification_type AS ENUM ('confirmation', 'reminder', 'update', 'cancellation');

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_users ON users USING (organization_id = current_setting('app.organization_id')::uuid);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_events ON events USING (organization_id = current_setting('app.organization_id')::uuid);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_venues ON venues USING (organization_id = current_setting('app.organization_id')::uuid);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs USING (organization_id = current_setting('app.organization_id')::uuid);
