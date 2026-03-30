# Audit Log Specification

## Overview

Audit logs provide an immutable trail of all significant operations in the
system. Each log entry captures the action type, affected entity, actor,
and optional contextual details. See [security.md](security.md) for access control.

## Service Layer

<!-- VERIFY:AUDIT-SERVICE -->
The `AuditLogService` implements listing audit logs with pagination and tenant
scoping. It provides a create method used internally by other services to
record audit entries. No update or delete operations are exposed.

## Controller Layer

<!-- VERIFY:AUDIT-CONTROLLER -->
The `AuditLogController` exposes a single read-only endpoint:
- `GET /audit-logs` — List audit logs (paginated, tenant-scoped)

The controller does not expose create, update, or delete endpoints. Audit
entries are created programmatically by other service methods.

## Pagination Support

<!-- VERIFY:PAGINATION-UTILS -->
The `pagination.utils.ts` module provides the `buildPaginatedResponse` helper
that all list endpoints use. It calculates total pages, has-next/has-previous
flags, and clamps page/pageSize to safe boundaries.

<!-- VERIFY:PAGINATION-DTO -->
The `PaginatedQuery` DTO defines shared query parameters (page, pageSize) with
class-validator decorators. It is reused across all list endpoints.

<!-- VERIFY:TEST-PAGINATION -->
Unit tests verify pagination edge cases: page=0 clamped to 1, pageSize clamped
to range [1, 100], correct total page calculation, and boundary conditions.

## Business Rules

- Logs are immutable — no PUT or DELETE endpoints
- Actions: CREATE, UPDATE, DELETE, LOGIN, EXPORT
- Details field stores contextual JSON data
- Indexed by tenant, user, and entity+entityId

## Cross-References

- Authentication for LOGIN action: see [authentication.md](authentication.md)
- Access control: see [security.md](security.md)
- Data model: see [data-model.md](data-model.md)

<!-- VERIFY:AUDIT-LOG-CONTROLLER-SPEC -->
<!-- VERIFY:AUDIT-LOG-SERVICE-SPEC -->
