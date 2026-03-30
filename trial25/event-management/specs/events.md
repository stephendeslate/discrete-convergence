# Events Domain Specification

## Overview

Events are the core entity of the platform. Each event belongs to a tenant and optionally a venue.
Events have lifecycle states managed through domain actions (publish, cancel).
All event operations are tenant-scoped via Row Level Security as described in [security.md](security.md).
Events follow the data model defined in [data-model.md](data-model.md).

## Requirements

### EM-EVT-001 — Event CRUD
Standard CRUD operations: create, read (single + list), update, delete.
All operations scoped to current tenant via RLS and TenantGuard.
List endpoint supports pagination with page/pageSize query params.
<!-- VERIFY:EM-EVT-001 — Event CRUD operations with tenant isolation and pagination -->

### EM-EVT-002 — Event Status Lifecycle
Events follow status transitions: DRAFT -> PUBLISHED -> COMPLETED or CANCELLED.
- publish(): Only DRAFT events can be published
- cancel(): Only DRAFT or PUBLISHED events can be cancelled
<!-- VERIFY:EM-EVT-002 — Event status lifecycle transitions enforced -->

### EM-EVT-003 — Publish Action
EventService.publish() validates event is in DRAFT status.
Returns 400 if event is not in DRAFT status with descriptive error message.
Contains branching logic: check status -> update to PUBLISHED.
Also validates start date is in the future and capacity is positive.
<!-- VERIFY:EM-EVT-003 — Publish action validates DRAFT status and future start date -->

### EM-EVT-004 — Cancel Action
EventService.cancel() validates event is in DRAFT or PUBLISHED status.
Returns 400 if event is in CANCELLED or COMPLETED status.
Contains branching logic: check status -> validate transition -> update to CANCELLED.
<!-- VERIFY:EM-EVT-004 — Cancel action validates DRAFT or PUBLISHED status -->

### EM-EVT-005 — Event-Venue Relationship
Events optionally reference a venue via venueId foreign key.
Venue association validated at database level via Prisma relation.
<!-- VERIFY:EM-EVT-005 — Event-venue relationship with optional FK -->

### EM-EVT-006 — Event Slug Uniqueness
Each event has a unique slug field within the tenant scope.
Duplicate slugs return 409 Conflict error.
<!-- VERIFY:EM-EVT-006 — edge case: duplicate event slug returns conflict error -->

### EM-EVT-007 — Event Date Validation
End date must be strictly after start date.
Validation applies to both create and update operations.
<!-- VERIFY:EM-EVT-007 — edge case: invalid date range returns validation error -->

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | Required, RLS filtered |
| title | String | Required, max 200 |
| description | String | Optional, max 2000 |
| slug | String | Required, unique |
| startDate | DateTime | Required |
| endDate | DateTime | Required, must be after startDate |
| status | EventStatus | Default: DRAFT |
| capacity | Int | Required, positive |
| venueId | UUID | Optional FK to Venue |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |
