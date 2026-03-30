# FD-SPEC-001: API Endpoints

## Overview
The Fleet Dispatch API is a NestJS REST API serving multi-tenant fleet management operations.
All endpoints require JWT authentication unless marked `@Public()`.

## Base URL
`http://localhost:3001`

## Authentication Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | Public | Returns JWT access token |
| POST | /auth/register | Public | Creates user, returns JWT |

<!-- VERIFY:FD-AUTH-006 — auth controller exposes public login/register -->

## Driver Endpoints
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /drivers | ADMIN, DISPATCHER | Create driver |
| GET | /drivers | Any authenticated | List drivers (paginated) |
| GET | /drivers/:id | Any authenticated | Get driver by ID |
| PUT | /drivers/:id | ADMIN, DISPATCHER | Update driver |
| DELETE | /drivers/:id | ADMIN | Delete driver |

<!-- VERIFY:FD-DRIVER-002 — driver controller with RBAC -->

## Vehicle Endpoints
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /vehicles | ADMIN, DISPATCHER | Create vehicle |
| GET | /vehicles | Any authenticated | List vehicles (paginated) |
| GET | /vehicles/:id | Any authenticated | Get vehicle by ID |
| PUT | /vehicles/:id | ADMIN, DISPATCHER | Update vehicle |
| DELETE | /vehicles/:id | ADMIN | Delete vehicle |

<!-- VERIFY:FD-VEH-002 — vehicle controller with RBAC -->

## Delivery Endpoints
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /deliveries | ADMIN, DISPATCHER | Create delivery |
| GET | /deliveries | Any authenticated | List deliveries (paginated, filterable by status) |
| GET | /deliveries/:id | Any authenticated | Get delivery by ID (includes driver, vehicle, route) |
| PUT | /deliveries/:id | ADMIN, DISPATCHER | Update delivery |
| DELETE | /deliveries/:id | ADMIN | Delete delivery |

<!-- VERIFY:FD-DEL-002 — delivery controller with RBAC -->

## Route Endpoints
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /routes | ADMIN, DISPATCHER | Create route |
| GET | /routes | Any authenticated | List routes (paginated) |
| GET | /routes/:id | Any authenticated | Get route by ID |
| PUT | /routes/:id | ADMIN, DISPATCHER | Update route |
| DELETE | /routes/:id | ADMIN | Delete route |

<!-- VERIFY:FD-ROUTE-002 — route controller with RBAC -->

## Tenant Endpoints (ADMIN only)
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /tenants | ADMIN | Create tenant |
| GET | /tenants | ADMIN | List tenants (paginated) |
| GET | /tenants/:id | ADMIN | Get tenant by ID |
| PUT | /tenants/:id | ADMIN | Update tenant |
| DELETE | /tenants/:id | ADMIN | Delete tenant |

<!-- VERIFY:FD-TENANT-002 — tenant controller ADMIN-only -->

## Audit Log Endpoints
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /audit-logs | ADMIN, DISPATCHER | List audit logs (paginated, filterable by entity) |

<!-- VERIFY:FD-AUDIT-002 — audit log controller read-only -->

## Monitoring Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /monitoring/health | Public | Health check |
| GET | /monitoring/metrics | Public | Application metrics |

<!-- VERIFY:FD-MON-011 — monitoring controller public endpoints -->

## Pagination
All list endpoints support `?page=N&pageSize=N` query parameters.
Page size is clamped to [1, 100] with a default of 20.

<!-- VERIFY:FD-PERF-001 — pagination clamping -->
