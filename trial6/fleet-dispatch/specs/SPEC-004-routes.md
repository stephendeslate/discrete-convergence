# SPEC-004: Routes

**Status:** APPROVED
**Domain:** Fleet Management — Routes
**Cross-references:** [SPEC-005](SPEC-005-deliveries.md), [SPEC-006](SPEC-006-multi-tenancy.md)

## Overview

Routes define the paths that vehicles follow for deliveries. Each route has an
origin, destination, optional waypoints, and distance/time estimates. Routes are
reusable across multiple deliveries.

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | VARCHAR(255) | Required |
| origin | VARCHAR(500) | Required |
| destination | VARCHAR(500) | Required |
| waypoints | JSON | Default: [] |
| distanceKm | DECIMAL(12,2) | Required, >= 0 |
| estimatedMinutes | INT | Required, >= 1 |
| actualMinutes | INT | Nullable |
| tenantId | UUID | FK to tenants |

<!-- VERIFY:FD-ROUTE-001 — route CRUD service with Decimal distance, tenant scoping -->

## API Endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /routes | ADMIN, DISPATCHER | Create route |
| GET | /routes | Any authenticated | List routes (paginated) |
| GET | /routes/:id | Any authenticated | Get route detail |
| PUT | /routes/:id | ADMIN, DISPATCHER | Update route |
| DELETE | /routes/:id | ADMIN | Delete route |

<!-- VERIFY:FD-ROUTE-002 — route controller with RBAC and pagination -->

## Waypoints

Waypoints are stored as a JSON array. Each waypoint can contain arbitrary
coordinate or address data:

```json
[
  { "lat": 40.72, "lng": -73.99 },
  { "lat": 40.73, "lng": -73.98 }
]
```

## Distance and Time

- `distanceKm` uses Decimal for precision (DECIMAL(12,2) in database)
- `estimatedMinutes` is the planned travel time
- `actualMinutes` is filled after route completion for analytics

## Tenant Isolation

All queries are scoped by `tenantId` from the JWT token.
