# SPEC-007: Audit Logging

**Status:** APPROVED
**Priority:** P1
**Cross-References:** SPEC-006 (Multi-Tenancy), SPEC-008 (Security)

## Overview

Immutable audit trail with admin-only read access, tenant-scoped filtering,
and entity-type filtering.

## Requirements

### VERIFY:EM-API-011 — Audit Log Service
AuditLogService provides:
- findAll: read-only, tenant-scoped, paginated, optional entity filter
- logAction: creates audit log entries (called by other services)
Includes user information (id, email, name) in query results.

### VERIFY:EM-API-012 — Audit Log Controller
AuditLogController restricted to ADMIN role at class level.
GET /audit-logs with query parameters for pagination and entity filter.
TenantId extracted from JWT for scoping.

## Data Model

- id: UUID primary key
- action: string (CREATE, UPDATE, DELETE, LOGIN, etc.)
- entity: string (Event, User, Venue, etc.)
- entityId: UUID of affected entity
- details: optional string description
- userId: FK to users (who performed action)
- tenantId: FK to tenants (scope)
- createdAt: timestamp (immutable)

## Immutability

Audit logs are append-only. No update or delete operations exposed via API.
The service only provides findAll (read) and logAction (create).

## Indexes

- tenantId for tenant-scoped queries
- userId for user activity queries
- Composite (tenantId, entity) for filtered queries
