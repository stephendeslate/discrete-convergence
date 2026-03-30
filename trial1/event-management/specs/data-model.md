# Data Model Specification

> **Project:** Event Management
> **Category:** DATA
> **Cross-references:** See [api-endpoints.md](api-endpoints.md), [infrastructure.md](infrastructure.md)

---

## Requirements

### VERIFY:EM-DATA-001 — Table Naming Convention

All Prisma models use `@@map("snake_case_plural")` to map to PostgreSQL table names.
Field-level `@map("snake_case")` for multi-word columns (e.g., `organizationId` → `organization_id`).
This ensures PostgreSQL naming conventions are followed while keeping camelCase in TypeScript.

### VERIFY:EM-DATA-002 — Event Model

Event model includes: name, slug (unique per org), description, status (EventStatus enum),
startDate, endDate, timezone (String), venue relation, organizationId. Status transitions
validated at service layer using an explicit state machine.

**Valid status transitions:**
- DRAFT → PUBLISHED, CANCELLED
- PUBLISHED → REGISTRATION_OPEN, CANCELLED
- REGISTRATION_OPEN → REGISTRATION_CLOSED, CANCELLED
- REGISTRATION_CLOSED → COMPLETED, CANCELLED
- Invalid transitions return 400 Bad Request with allowed transitions list

### VERIFY:EM-DATA-003 — Registration Model

Registration model links User to Event with TicketType. Status field uses RegistrationStatus
enum (PENDING, CONFIRMED, CANCELLED, WAITLISTED, CHECKED_IN). Includes createdAt for
waitlist FIFO ordering. Unique constraint on `[userId, eventId]` prevents duplicate registrations.

### VERIFY:EM-DATA-004 — Monetary Values

Ticket prices stored as `Int` (cents) to avoid floating-point precision issues.
Display conversion happens at the frontend layer. Decimal type available for precise
calculations where needed (e.g., tax computation, refund amounts).

### VERIFY:EM-DATA-005 — Enum Conventions

All enums use `@@map("snake_case")` for PostgreSQL type names. Enum values use
`@map("UPPER_SNAKE")` for database representation. Examples:
- `EventStatus @@map("event_status")` with values like `DRAFT @map("DRAFT")`
- `RegistrationStatus @@map("registration_status")`
- `UserRole @@map("user_role")`

### VERIFY:EM-DATA-006 — RLS via executeRaw

Row Level Security set via `$executeRaw` with `Prisma.sql` tagged template literal.
Never uses `$executeRawUnsafe`. Sets `app.current_organization_id` for tenant isolation.
RLS policies enforce that queries can only access data belonging to the current organization.
See [infrastructure.md](infrastructure.md) for migration-level RLS setup.

### VERIFY:EM-DATA-007 — Indexes and Relations

Composite `@@index` on `[organizationId, status]` and `[organizationId, slug]` for common
queries. Additional indexes on `[eventId, status]` for registration lookups. Relations use
`include` to prevent N+1 queries in service methods.

### VERIFY:EM-DATA-008 — Seed Script

Seed script creates demo organization, admin user (bcrypt hash with `BCRYPT_SALT_ROUNDS`
from shared), sample events in multiple lifecycle states (DRAFT, PUBLISHED, REGISTRATION_OPEN,
COMPLETED), venues, ticket types, and registrations including waitlisted and cancelled states.
Includes error handling with `console.error` + `process.exit(1)` on failure.
The seed imports `BCRYPT_SALT_ROUNDS` from `@event-management/shared`.
