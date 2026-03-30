# SPEC-005: Deliveries

**Status:** APPROVED
**Domain:** Fleet Management — Deliveries
**Cross-references:** [SPEC-002](SPEC-002-vehicles.md), [SPEC-003](SPEC-003-drivers.md), [SPEC-004](SPEC-004-routes.md), [SPEC-006](SPEC-006-multi-tenancy.md)

## Overview

Deliveries are the core operational entity. Each delivery represents a package or
shipment being transported from origin to destination. Deliveries link to vehicles,
drivers, and routes, and progress through a status lifecycle.

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| trackingCode | VARCHAR(50) | Required |
| status | DeliveryStatus | Default: PENDING |
| recipientName | VARCHAR(255) | Required |
| address | VARCHAR(500) | Required |
| notes | TEXT | Nullable |
| cost | DECIMAL(12,2) | Default: 0, uses Decimal |
| vehicleId | UUID | Nullable FK to vehicles |
| driverId | UUID | Nullable FK to drivers |
| routeId | UUID | Nullable FK to routes |
| tenantId | UUID | FK to tenants |
| scheduledAt | DATETIME | Nullable |
| deliveredAt | DATETIME | Nullable |

<!-- VERIFY:FD-DEL-001 — delivery CRUD service with Decimal cost, tenant scoping -->

## Delivery Statuses

- `PENDING` — created but not yet assigned
- `ASSIGNED` — assigned to a driver and vehicle
- `IN_TRANSIT` — currently being delivered
- `DELIVERED` — successfully completed
- `FAILED` — delivery attempt failed

## API Endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /deliveries | ADMIN, DISPATCHER | Create delivery |
| GET | /deliveries | Any authenticated | List deliveries (paginated, filterable by status) |
| GET | /deliveries/:id | Any authenticated | Get delivery detail (includes driver, vehicle, route) |
| PUT | /deliveries/:id | ADMIN, DISPATCHER | Update delivery |
| DELETE | /deliveries/:id | ADMIN | Delete delivery |

<!-- VERIFY:FD-DEL-002 — delivery controller with RBAC, pagination, and status filter -->

## Status Filtering

The list endpoint supports `?status=IN_TRANSIT` query parameter to filter by
delivery status.

## Included Relations

Detail and list responses include related `driver`, `vehicle`, and `route` objects
for display purposes.

## Cost Tracking

Delivery cost uses Decimal type for financial precision. The `cost` field maps to
`DECIMAL(12,2)` in PostgreSQL.
