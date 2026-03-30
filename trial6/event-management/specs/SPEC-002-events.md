# SPEC-002: Events

**Status:** APPROVED
**Priority:** P0
**Cross-References:** SPEC-001 (Authentication), SPEC-005 (Venues), SPEC-006 (Multi-Tenancy)

## Overview

Event lifecycle management with tenant-scoped CRUD, venue association,
and status transitions.

## Requirements

### VERIFY:EM-API-001 — Event Service CRUD
EventService provides create, findAll (paginated, tenant-scoped), findOne (tenant-verified),
update (tenant-verified), delete (tenant-verified).

### VERIFY:EM-API-002 — Event Controller
EventController maps HTTP methods to EventService. Extracts tenantId from JWT user payload.
Create and update restricted to ADMIN and ORGANIZER roles. Delete restricted to ADMIN.

## Verification Criteria

1. CRUD operations are tenant-scoped — no cross-tenant data leaks
2. Create/update restricted to ADMIN and ORGANIZER roles
3. Delete restricted to ADMIN role only
4. Pagination returns correct meta (total, page, pageSize, totalPages)
5. FindOne returns 404 for events in other tenants

## Data Model

- id: UUID primary key
- title: string (max 255)
- description: optional string (max 2000)
- status: DRAFT | PUBLISHED | CANCELLED | COMPLETED (default DRAFT)
- startDate, endDate: DateTime
- tenantId: FK to tenants (set from JWT, not request body)
- venueId: optional FK to venues

## Lifecycle

Events follow a state machine: DRAFT -> PUBLISHED -> COMPLETED or CANCELLED.
Status transitions are enforced via the update DTO's @IsIn validator.

## Tenant Isolation

- Create: tenantId overridden from JWT payload
- FindAll: filtered by tenantId from JWT
- FindOne: verified tenantId matches JWT
- Update/Delete: verified tenantId matches JWT before operation

## Pagination

Uses shared clampPagination (max 100 per page, default 20).
Returns PaginatedResult with data array and meta (total, page, pageSize, totalPages).
