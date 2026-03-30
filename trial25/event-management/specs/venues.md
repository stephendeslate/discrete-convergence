# Venues Domain Specification

## Overview

Venues represent physical or virtual locations where events take place.
Each venue belongs to a tenant and can host multiple events.
Venue operations are secured with JWT authentication and tenant isolation via [security.md](security.md).
Venues follow the data model constraints defined in [data-model.md](data-model.md).

## Requirements

### EM-VEN-001 — Venue CRUD
Standard CRUD operations: create, read (single + list), update, delete.
All operations scoped to current tenant via RLS and TenantGuard.
List endpoint supports pagination with page/pageSize query parameters.
Create requires name, address, city, and capacity fields.
<!-- VERIFY:EM-VEN-001 — Venue CRUD operations with tenant isolation and pagination -->

### EM-VEN-002 — Venue Capacity
Venues have a capacity field indicating maximum attendee count.
Capacity must be a positive integer validated at the DTO level.
<!-- VERIFY:EM-VEN-002 — Venue capacity is validated as positive integer -->

### EM-VEN-003 — Venue Listing
GET /venues returns paginated results scoped to current tenant.
Results ordered by creation date descending.
Supports standard pagination parameters (page, pageSize).
<!-- VERIFY:EM-VEN-003 — Venue listing returns tenant-scoped paginated results -->

### EM-VEN-004 — Venue Validation
All string fields have @MaxLength constraints on DTOs.
Name and address are required fields.
City is a required field with MaxLength(200).
<!-- VERIFY:EM-VEN-004 — edge case: invalid venue data returns validation error -->

### EM-VEN-005 — Venue-Event Relationship
Venues have a one-to-many relationship with events.
Deleting a venue that has associated events should be handled by the database.
<!-- VERIFY:EM-VEN-005 — Venue has one-to-many relationship with events -->

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | Required, RLS filtered |
| name | String | Required, max 200 |
| address | String | Required, max 500 |
| city | String | Required, max 200 |
| capacity | Int | Required, positive |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

## Relationships

- Venue has many Events (via venue_id FK in events table)
- Events reference Venue optionally via venueId field
