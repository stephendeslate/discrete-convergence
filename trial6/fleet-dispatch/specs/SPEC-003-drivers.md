# SPEC-003: Drivers

**Status:** APPROVED
**Domain:** Fleet Management — Drivers
**Cross-references:** [SPEC-002](SPEC-002-vehicles.md), [SPEC-005](SPEC-005-deliveries.md), [SPEC-006](SPEC-006-multi-tenancy.md)

## Overview

Drivers are the personnel who operate vehicles and execute deliveries. Each driver
belongs to a tenant and may optionally be assigned to a vehicle. Availability
tracking supports dispatch decisions.

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | VARCHAR(255) | Required |
| licenseNumber | VARCHAR(50) | Required |
| phone | VARCHAR(20) | Required |
| available | BOOLEAN | Default: true |
| vehicleId | UUID | Nullable FK to vehicles |
| tenantId | UUID | FK to tenants |

<!-- VERIFY:FD-DRIVER-001 — driver CRUD service with tenant scoping and pagination -->

## API Endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /drivers | ADMIN, DISPATCHER | Create driver |
| GET | /drivers | Any authenticated | List drivers (paginated) |
| GET | /drivers/:id | Any authenticated | Get driver detail |
| PUT | /drivers/:id | ADMIN, DISPATCHER | Update driver |
| DELETE | /drivers/:id | ADMIN | Delete driver |

<!-- VERIFY:FD-DRIVER-002 — driver controller with RBAC and pagination -->

## Availability

- `available: true` means the driver can be dispatched
- `available: false` means the driver is off-duty or already assigned
- Availability is toggled via the update endpoint

## Vehicle Assignment

- A driver can be assigned to one vehicle via `vehicleId`
- Setting `vehicleId` to `null` unassigns the driver
- Vehicle assignment does not affect availability status

## Tenant Isolation

All queries are scoped by `tenantId` from the JWT token. Drivers from
other tenants are never visible or modifiable.
