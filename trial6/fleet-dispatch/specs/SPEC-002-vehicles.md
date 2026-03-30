# SPEC-002: Vehicles

**Status:** APPROVED
**Domain:** Fleet Management — Vehicles
**Cross-references:** [SPEC-003](SPEC-003-drivers.md), [SPEC-005](SPEC-005-deliveries.md), [SPEC-006](SPEC-006-multi-tenancy.md)

## Overview

Vehicles represent the physical fleet assets. Each vehicle belongs to a tenant
and can be assigned to drivers and deliveries. Vehicle status tracks availability
for dispatch operations.

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| licensePlate | VARCHAR(20) | Required |
| make | VARCHAR(100) | Required |
| model | VARCHAR(100) | Required |
| year | INT | 1900-2100 |
| status | VehicleStatus | Default: AVAILABLE |
| latitude | DECIMAL(10,7) | Nullable |
| longitude | DECIMAL(10,7) | Nullable |
| mileage | DECIMAL(12,2) | Default: 0 |
| tenantId | UUID | FK to tenants |

<!-- VERIFY:FD-VEH-001 — vehicle CRUD service with Decimal mileage, tenant scoping -->

## Vehicle Statuses

- `AVAILABLE` — ready for dispatch
- `IN_TRANSIT` — currently on a delivery route
- `MAINTENANCE` — undergoing service or repair
- `RETIRED` — decommissioned from the fleet

## API Endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /vehicles | ADMIN, DISPATCHER | Create vehicle |
| GET | /vehicles | Any authenticated | List vehicles (paginated) |
| GET | /vehicles/:id | Any authenticated | Get vehicle detail |
| PUT | /vehicles/:id | ADMIN, DISPATCHER | Update vehicle |
| DELETE | /vehicles/:id | ADMIN | Delete vehicle |

<!-- VERIFY:FD-VEH-002 — vehicle controller with RBAC and pagination -->

## Pagination

All list endpoints return paginated results:
```json
{
  "data": [...],
  "meta": { "total": 50, "page": 1, "pageSize": 20, "totalPages": 3 }
}
```

Page and pageSize are clamped via `clampPagination()` from shared package.

## Tenant Isolation

All queries are scoped by `tenantId` extracted from the JWT token.
Vehicles from other tenants are never visible or accessible.
