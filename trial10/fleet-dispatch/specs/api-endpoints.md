# API Endpoints Specification

> **Project:** Fleet Dispatch
> **Category:** API
> **Related:** See [data-model.md](data-model.md) for entity definitions, see [authentication.md](authentication.md) for auth flow

---

## Overview

The fleet dispatch API provides RESTful CRUD endpoints for managing vehicles, drivers, routes, dispatches, and maintenance records. All domain endpoints require JWT authentication and are tenant-scoped. Pagination is supported via `page` and `limit` query parameters with clamping from the shared package.

---

## Requirements

### VERIFY:FD-API-001 — Vehicle CRUD controller

The vehicle controller provides full CRUD operations at `/vehicles`. Create and update require `ADMIN` or `DISPATCHER` role. Delete requires `ADMIN` role. The list endpoint includes `Cache-Control: private, no-cache` headers. All operations are scoped by tenantId extracted from the JWT.

### VERIFY:FD-API-002 — Driver CRUD controller

The driver controller provides full CRUD operations at `/drivers`. All operations are scoped by tenantId. The service implements soft-delete by setting driver status to `OFF_DUTY`.

### VERIFY:FD-API-003 — Route CRUD controller

The route controller provides full CRUD operations at `/routes`. All operations are scoped by tenantId. Routes include origin, destination, and distance fields.

### VERIFY:FD-API-004 — Registration DTO validation

The registration DTO uses class-validator decorators: `@IsEmail()` for email, `@MinLength(8)` for password, `@IsIn(ALLOWED_REGISTRATION_ROLES)` for role, and `@IsString()` for tenantId. All fields are required and validated at the pipe level.

### VERIFY:FD-API-005 — Dispatch controller with status transitions

The dispatch controller provides CRUD at `/dispatches`. Status transitions are validated — dispatches move through PENDING, IN_TRANSIT, DELIVERED, or CANCELLED states.

### VERIFY:FD-API-006 — Cache-Control headers on list endpoints

All list (findAll) endpoints in domain controllers set `Cache-Control: private, no-cache` response headers to prevent stale data caching.

### VERIFY:FD-DISP-001 — Dispatch CRUD controller

The dispatch controller at `/dispatches` provides full CRUD operations scoped by tenantId. All operations extract the tenant from the JWT-authenticated request.

### VERIFY:FD-DISP-002 — Dispatch service with N+1 prevention

The dispatch service uses Prisma `include` to eagerly load related Vehicle, Driver, and Route associations, preventing N+1 query issues in list and detail endpoints.

### VERIFY:FD-MAINT-001 — Maintenance CRUD controller

The maintenance controller at `/maintenance` provides full CRUD operations for tracking vehicle maintenance records. All operations are tenant-scoped.

### VERIFY:FD-MAINT-002 — Maintenance service with Decimal cost

The maintenance service handles maintenance records with Decimal cost fields for accurate financial tracking. Cost uses `@db.Decimal(12,2)` in the Prisma schema.

---

## Endpoint Map

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login and get tokens |
| POST | /auth/refresh | Public | Refresh access token |
| GET | /vehicles | JWT | List vehicles (paginated) |
| POST | /vehicles | JWT + ADMIN/DISPATCHER | Create vehicle |
| GET | /vehicles/:id | JWT | Get vehicle by ID |
| PATCH | /vehicles/:id | JWT + ADMIN/DISPATCHER | Update vehicle |
| DELETE | /vehicles/:id | JWT + ADMIN | Soft-delete vehicle |
| GET | /drivers | JWT | List drivers (paginated) |
| POST | /drivers | JWT | Create driver |
| GET | /drivers/:id | JWT | Get driver by ID |
| PATCH | /drivers/:id | JWT | Update driver |
| DELETE | /drivers/:id | JWT | Soft-delete driver |
| GET | /routes | JWT | List routes (paginated) |
| POST | /routes | JWT | Create route |
| GET | /routes/:id | JWT | Get route by ID |
| PATCH | /routes/:id | JWT | Update route |
| DELETE | /routes/:id | JWT | Delete route |
| GET | /dispatches | JWT | List dispatches (paginated) |
| POST | /dispatches | JWT | Create dispatch |
| GET | /dispatches/:id | JWT | Get dispatch by ID |
| PATCH | /dispatches/:id | JWT | Update dispatch |
| DELETE | /dispatches/:id | JWT | Delete dispatch |
| GET | /maintenance | JWT | List maintenance records |
| POST | /maintenance | JWT | Create maintenance record |
| GET | /health | Public | Health check |
| GET | /health/ready | Public | Readiness check |
| GET | /metrics | JWT | Application metrics |
