# Audit Logs Specification

## Overview

Immutable audit trail for all data mutations across the platform.
Every create, update, and delete operation is recorded with context
(who, what, when, which tenant) for compliance and debugging.

## Schema

<!-- VERIFY:AUDIT-SCHEMA — AuditLog has id, action, entityType, entityId, userId, tenantId, metadata -->
Fields:
- **id** — UUID, primary key
- **action** — AuditAction enum (create, update, delete, login, export)
- **entity** — string identifying the entity type (e.g., "dashboard", "widget")
- **entityId** — UUID of the affected entity
- **userId** — FK to User who performed the action
- **tenantId** — tenant scope for RLS isolation
- **details** — optional JSON payload with before/after values
- **createdAt** — timestamp of the audit event

## Logged Actions

<!-- VERIFY:AUDIT-ACTIONS — All CRUD mutations generate audit log entries -->
The following operations generate audit log entries:
- Dashboard create, update, delete
- Widget create, update, delete
- Data source create, update, delete, sync
- User registration and login
- Data export events

The AuditAction enum in the Prisma schema maps to lowercase values
via `@@map("audit_action")`.

## Immutability

<!-- VERIFY:AUDIT-IMMUTABLE — Audit logs are append-only, no update or delete operations -->
Audit log entries are append-only. The AuditLogService provides only
`findAll()` and `create()` methods — no update or delete operations exist.
This ensures the audit trail cannot be tampered with after the fact.

## Tenant Isolation

Audit logs are scoped by tenantId. Each log entry records the acting
userId and timestamp. The AuditLogController applies AuthGuard and
TenantGuard to ensure users can only view their own tenant's audit trail.

## Service Layer

AuditLogService methods:
- `findAll(tenantId, page, limit)` — paginated list with tenant filter
- `create(action, entity, entityId, userId, tenantId, details?)` — append new entry

The create method validates that entity and entityId are non-empty before
persisting, throwing an Error if either is missing.

## Query Patterns

- Default sort: createdAt DESC (most recent first)
- Pagination via getPrismaSkipTake from common/pagination.utils
- Filter by entity/entityId index for fast lookups

## Implementation Traceability

<!-- VERIFY:AE-AL-001 — AuditLogService create method -->
<!-- VERIFY:AE-AL-002 — AuditLogService findAll with pagination -->
<!-- VERIFY:AE-AL-003 — AuditLog entity validation -->
<!-- VERIFY:AE-AL-CTRL-001 — AuditLog controller with list endpoint -->
<!-- VERIFY:AE-AL-MOD-001 — AuditLogModule definition -->
<!-- VERIFY:AUDIT-CTRL — AuditLog controller implementation -->
<!-- VERIFY:AUDIT-CTRL-TEST — AuditLog controller unit tests -->
<!-- VERIFY:AUDIT-MOD — AuditLog module definition -->
<!-- VERIFY:AUDIT-SVC — AuditLog service implementation -->
<!-- VERIFY:AUDIT-SVC-TEST — AuditLog service unit tests -->

## Cross-References

- See also: [data-model.md](data-model.md) — AuditLog model definition and enum mappings
- See also: [security.md](security.md) — audit logging as a security control
- See also: [api-endpoints.md](api-endpoints.md) — audit log API endpoints
