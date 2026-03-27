# Data Model Specification

## Overview
Prisma schema with 7 models, snake_case mapping, composite indexes, and RLS support.

### VERIFY: EM-DATA-001 — Prisma schema has 7+ models with @@map for snake_case
All models use `@@map` for table names and `@map` for column names to enforce snake_case in PostgreSQL.
Models: Tenant, User, Event, Venue, TicketType, Registration, AuditLog.
Example: `model User { ... @@map("users") }` and `tenantId String @map("tenant_id")`.
This mapping ensures the TypeScript-facing API uses camelCase while the database uses snake_case.

### VERIFY: EM-DATA-002 — Tenant model with tier enum
Tenant has id, name, slug (unique), tier (TenantTier enum: FREE/PRO/ENTERPRISE), createdAt, updatedAt.
The `slug` field has a `@unique` constraint for tenant identification in URLs and API scoping.
The `tier` enum controls feature access and rate limits across the platform.
Default tier for new tenants is FREE unless overridden during registration.

### VERIFY: EM-DATA-003 — User model with tenant relation
User has id, email, passwordHash, tenantId (FK), role (UserRole enum), createdAt, updatedAt.
Unique constraint on (tenantId, email) — the same email can exist under different tenants.
The `passwordHash` field stores the bcryptjs hash (see [authentication.md](authentication.md) for hashing details).
The `role` field uses the UserRole enum which includes ADMIN and MEMBER roles.
Cascade: When a tenant is deleted, all associated users are also deleted.

### VERIFY: EM-DATA-004 — Event model with status enum
Event has id, tenantId, name, description, startDate, endDate, status (EventStatus enum: DRAFT/PUBLISHED/CANCELLED/COMPLETED), venueId (optional FK).
The `status` enum drives the event lifecycle: DRAFT → PUBLISHED → COMPLETED (or CANCELLED from any state).
The `venueId` is optional — events may not have a physical venue assigned.
Edge case: Events with registrations cannot transition directly to DRAFT from PUBLISHED.

### VERIFY: EM-DATA-005 — All models have @@index on foreign keys
Every foreign key has an `@@index` directive. Composite indexes on (tenantId, status) for events.
This ensures efficient joins and tenant-scoped queries across all models.
The composite index on events allows efficient filtering by tenant and event status simultaneously.
Additional indexes exist on (tenantId, email) for the User model and (eventId) for TicketType and Registration.

### VERIFY: EM-DATA-006 — TicketType model with sold tracking
TicketType has id, eventId, name, price, quantity, sold (default 0).
The `sold` field is incremented atomically during registration to prevent overselling.
The `price` field is stored as a Decimal/Float for precise monetary calculations.
Edge case: `sold` must never exceed `quantity`. The registration service validates this constraint.

### VERIFY: EM-DATA-007 — Registration model with status enum
Registration has id, eventId, ticketTypeId, attendeeName, attendeeEmail, status (RegistrationStatus: CONFIRMED/CANCELLED/WAITLISTED).
Status transitions: WAITLISTED → CONFIRMED (when capacity frees up), CONFIRMED → CANCELLED, WAITLISTED → CANCELLED.
The `attendeeEmail` is not a foreign key to User — attendees can register without a platform account.
Each registration links to exactly one TicketType and one Event.

### VERIFY: EM-DATA-008 — AuditLog model for activity tracking
AuditLog has id, tenantId, action, entity, entityId, userId (optional), metadata, createdAt.
The `metadata` field is a JSON column storing additional context about the action (e.g., changed fields).
The `userId` is optional to support system-generated audit entries (e.g., automated status transitions).
AuditLog entries are immutable — they cannot be updated or deleted after creation.
The monitoring system references audit log data (see [monitoring.md](monitoring.md) for observability details).
The `action` field uses a consistent naming convention: CREATE, UPDATE, DELETE, PUBLISH, CANCEL.
