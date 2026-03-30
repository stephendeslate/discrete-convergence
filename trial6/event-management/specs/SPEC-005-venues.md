# SPEC-005: Venues

**Status:** APPROVED
**Priority:** P1
**Cross-References:** SPEC-002 (Events), SPEC-006 (Multi-Tenancy)

## Overview

Venue CRUD with capacity tracking, tenant-scoped access, and event association.

## Requirements

### VERIFY:EM-API-003 — Venue Service CRUD
VenueService provides create, findAll (paginated, tenant-scoped), findOne (tenant-verified),
update (tenant-verified), delete (tenant-verified).

### VERIFY:EM-API-004 — Venue Controller
VenueController maps HTTP methods to VenueService with tenant extraction from JWT.
Create and update restricted to ADMIN/ORGANIZER. Delete restricted to ADMIN.

## Verification Criteria

1. Venue CRUD is tenant-scoped — no cross-tenant data access
2. Capacity must be a positive integer (min 1)
3. Venue deletion sets venueId to NULL on associated events
4. Create/update restricted to ADMIN/ORGANIZER, delete to ADMIN
5. FindOne returns 404 for venues in other tenants

## Data Model

- id: UUID primary key
- name: string (max 255)
- address: string (max 500)
- capacity: positive integer (min 1)
- tenantId: FK to tenants (set from JWT)

## Tenant Isolation

Follows same pattern as Events (SPEC-002):
- Create: tenantId overridden from JWT payload
- FindAll: filtered by tenantId
- FindOne/Update/Delete: verified tenantId matches JWT

## Event Association

Events reference venues via optional venueId FK. A venue can host multiple events.
Deleting a venue sets venueId to NULL on associated events (ON DELETE SET NULL).
