# SPEC-007: Audit Logging

**Status:** APPROVED
**Domain:** Compliance — Audit Trail
**Cross-references:** [SPEC-006](SPEC-006-multi-tenancy.md), [SPEC-008](SPEC-008-security.md)

## Overview

Fleet Dispatch maintains an audit log of significant actions for compliance and
troubleshooting. Audit logs are immutable (append-only) and tenant-scoped.

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| action | VARCHAR(100) | Required (e.g., CREATE, UPDATE, DELETE) |
| entity | VARCHAR(100) | Required (e.g., vehicle, driver, delivery) |
| entityId | UUID | Required — ID of the affected entity |
| details | JSON | Default: {} — additional context |
| userId | UUID | FK to users — who performed the action |
| tenantId | UUID | FK to tenants |
| createdAt | DATETIME | Auto-generated, immutable |

<!-- VERIFY:FD-AUDIT-001 — audit log service with tenant scoping and pagination -->

## API Endpoints

Audit logs are read-only via the API:

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /audit-logs | ADMIN, DISPATCHER | List audit logs (paginated, filterable by entity) |

<!-- VERIFY:FD-AUDIT-002 — audit log controller (read-only, ADMIN/DISPATCHER) -->

## Filtering

The list endpoint supports `?entity=vehicle` query parameter to filter logs
by entity type.

## Immutability

- Audit logs have no update or delete endpoints
- The `AuditLogService.create()` method is used internally by other services
- Only `createdAt` timestamp is recorded (no `updatedAt`)

## Tenant Isolation

Audit logs are scoped by `tenantId`. Users can only view audit logs for their
own tenant.

## Indexed Queries

- `(tenantId)` — primary access pattern
- `(userId)` — filter by acting user
- `(tenantId, entity)` — filter by entity type within tenant
