# Data Model Specification

## Overview

The Event Management platform uses PostgreSQL 16 with Prisma ORM.
All models follow strict naming conventions, indexing strategies, and
Row Level Security (RLS) for multi-tenant data isolation.

## Entity Relationships

```
Organization (tenant root)
  ├── User (many)
  ├── Event (many)
  │     ├── EventSession (many)
  │     ├── TicketType (many)
  │     ├── Registration (many)
  │     │     ├── CheckIn (one, optional)
  │     │     └── RegistrationFieldValue (many)
  │     ├── RegistrationField (many)
  │     ├── WaitlistEntry (many)
  │     └── Notification (many)
  ├── Venue (many)
  ├── NotificationTemplate (many)
  └── AuditLog (many)
```

## Naming Conventions

- All models use `@@map('snake_case_table_name')`
- All enums use `@@map('snake_case_enum_name')` with `@map('value')` on each value
- All field mappings use `@map('snake_case')` for multi-word fields

## Indexing Strategy

<!-- VERIFY:EM-DATA-001 — Event service uses $executeRaw for audit logging -->
- At least one service uses `$executeRaw(Prisma.sql)` for raw SQL operations

<!-- VERIFY:EM-DATA-002 — Database indexes on tenantId, status, and composite keys -->
- `@@index` on all `organizationId` foreign keys for tenant isolation queries
- `@@index` on `status` fields for status-based filtering
- `@@index` on composite `(organizationId, status)` for tenant-scoped status queries

## Event Status Machine

```
DRAFT -> PUBLISHED -> REGISTRATION_OPEN -> REGISTRATION_CLOSED -> IN_PROGRESS -> COMPLETED -> ARCHIVED
Any state (except COMPLETED) -> CANCELLED
```

## Registration Status Machine

```
PENDING -> CONFIRMED -> CHECKED_IN
PENDING -> CANCELLED
CONFIRMED -> CANCELLED
PENDING -> WAITLISTED -> PROMOTED -> CONFIRMED
```

## Row Level Security

<!-- VERIFY:EM-DATA-003 — Migration includes ENABLE and FORCE ROW LEVEL SECURITY -->
- All tables have `ENABLE ROW LEVEL SECURITY`
- All tables have `FORCE ROW LEVEL SECURITY`
- RLS policies enforce tenant isolation at the database level

## Ticket Pricing

- Ticket prices are stored as integers representing cents
- Display conversion to dollars happens in the UI layer
- No Decimal or Float types for pricing — integer arithmetic only

## Enums

| Enum | Values |
|------|--------|
| UserRole | ADMIN, ORGANIZER, ATTENDEE |
| EventStatus | DRAFT, PUBLISHED, REGISTRATION_OPEN, REGISTRATION_CLOSED, IN_PROGRESS, COMPLETED, ARCHIVED, CANCELLED |
| RegistrationStatus | PENDING, CONFIRMED, CHECKED_IN, CANCELLED, WAITLISTED, PROMOTED |
| FieldType | TEXT, EMAIL, PHONE, SELECT, CHECKBOX |
| NotificationStatus | PENDING, SENT, FAILED, DELIVERED |

## Cross-References

- See [api-endpoints.md](api-endpoints.md) for how entities are exposed via REST
- See [infrastructure.md](infrastructure.md) for migration and seed details
