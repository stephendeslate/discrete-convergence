# Fleet Dispatch — Specification Index

This document indexes all specification files for the Fleet Dispatch multi-tenant
fleet management platform. Each spec is identified by a unique ID and covers a
discrete concern of the system.

## Conventions

- **VERIFY** tags in specs correspond to **TRACED** tags in source code.
- Status: DRAFT | APPROVED | IMPLEMENTED
- Specs are living documents updated as the system evolves.

---

## Spec Registry

| ID | Title | File | Status | Summary |
|----|-------|------|--------|---------|
| FD-SPEC-001 | Authentication | [SPEC-001-authentication.md](SPEC-001-authentication.md) | APPROVED | JWT-based auth, bcrypt hashing, registration flow, token structure |
| FD-SPEC-002 | Vehicles | [SPEC-002-vehicles.md](SPEC-002-vehicles.md) | APPROVED | Vehicle fleet management, status tracking, GPS coordinates |
| FD-SPEC-003 | Drivers | [SPEC-003-drivers.md](SPEC-003-drivers.md) | APPROVED | Driver management, availability, vehicle assignment |
| FD-SPEC-004 | Routes | [SPEC-004-routes.md](SPEC-004-routes.md) | APPROVED | Route definitions, waypoints, distance/time tracking |
| FD-SPEC-005 | Deliveries | [SPEC-005-deliveries.md](SPEC-005-deliveries.md) | APPROVED | Delivery tracking, status lifecycle, cost management |
| FD-SPEC-006 | Multi-Tenancy | [SPEC-006-multi-tenancy.md](SPEC-006-multi-tenancy.md) | APPROVED | Tenant isolation, RLS, tier management |
| FD-SPEC-007 | Audit Logging | [SPEC-007-audit-logging.md](SPEC-007-audit-logging.md) | APPROVED | Immutable audit trail, tenant-scoped, entity filtering |
| FD-SPEC-008 | Security | [SPEC-008-security.md](SPEC-008-security.md) | APPROVED | RBAC, input validation, rate limiting, helmet, RLS |
| FD-SPEC-009 | API Conventions | [SPEC-009-api-conventions.md](SPEC-009-api-conventions.md) | APPROVED | Pagination, error format, correlation IDs, logging |

### Legacy Specs (detailed references)

| ID | Title | File | Status | Summary |
|----|-------|------|--------|---------|
| FD-SPEC-L01 | API Endpoints | [api-endpoints.md](api-endpoints.md) | IMPLEMENTED | REST API route definitions, request/response contracts, pagination |
| FD-SPEC-L02 | Authentication | [authentication.md](authentication.md) | IMPLEMENTED | JWT-based auth, bcrypt hashing, registration flow, token structure |
| FD-SPEC-L03 | Data Model | [data-model.md](data-model.md) | IMPLEMENTED | Prisma schema, entity relationships, enums, multi-tenant design |
| FD-SPEC-L04 | Frontend | [frontend.md](frontend.md) | IMPLEMENTED | Next.js 15 web app, pages, components, server actions |
| FD-SPEC-L05 | Infrastructure | [infrastructure.md](infrastructure.md) | IMPLEMENTED | Docker, CI/CD, environment config, database migrations |
| FD-SPEC-L06 | Monitoring | [monitoring.md](monitoring.md) | IMPLEMENTED | Health checks, metrics, structured logging, correlation IDs |
| FD-SPEC-L07 | Security | [security.md](security.md) | IMPLEMENTED | RBAC, tenant isolation, input validation, rate limiting, helmet |
| FD-SPEC-L08 | Cross-Layer | [cross-layer.md](cross-layer.md) | IMPLEMENTED | End-to-end flows, frontend-to-API contracts, error propagation |

---

## TRACED Tag Index

All TRACED tags used in the codebase, grouped by domain:

### Authentication (FD-AUTH-*)
- FD-AUTH-001 — bcrypt salt rounds constant
- FD-AUTH-002 — allowed registration roles
- FD-AUTH-003 — registration DTO with role validation
- FD-AUTH-004 — JWT passport strategy
- FD-AUTH-005 — auth service with hashing and token generation
- FD-AUTH-006 — auth controller with public endpoints

### Security (FD-SEC-*)
- FD-SEC-001 — public route decorator
- FD-SEC-002 — roles decorator for RBAC
- FD-SEC-003 — JWT auth guard (APP_GUARD)
- FD-SEC-004 — RBAC roles guard (APP_GUARD)

### Data Access (FD-DA-*)
- FD-DA-001 — Prisma service lifecycle

### Domain Modules (FD-DRIVER-*, FD-VEH-*, FD-DEL-*, FD-ROUTE-*, FD-TENANT-*, FD-AUDIT-*)
- FD-DRIVER-001 — driver CRUD service
- FD-DRIVER-002 — driver controller
- FD-VEH-001 — vehicle CRUD service (Decimal mileage)
- FD-VEH-002 — vehicle controller
- FD-DEL-001 — delivery CRUD service (Decimal cost)
- FD-DEL-002 — delivery controller
- FD-ROUTE-001 — route CRUD service (Decimal distance)
- FD-ROUTE-002 — route controller
- FD-TENANT-001 — tenant CRUD service
- FD-TENANT-002 — tenant controller
- FD-AUDIT-001 — audit log service
- FD-AUDIT-002 — audit log controller

### Monitoring (FD-MON-*)
- FD-MON-001 — app version constant
- FD-MON-002 — correlation ID generation
- FD-MON-003 — structured log entry formatting
- FD-MON-004 — log context sanitization
- FD-MON-005 — Pino structured logger
- FD-MON-006 — request-scoped context
- FD-MON-007 — in-memory metrics service
- FD-MON-008 — global exception filter
- FD-MON-009 — correlation ID middleware
- FD-MON-010 — request logging middleware
- FD-MON-011 — monitoring controller

### Performance (FD-PERF-*)
- FD-PERF-001 — pagination clamping
- FD-PERF-002 — response time interceptor

### Infrastructure (FD-INF-*)
- FD-INF-001 — environment variable validation
- FD-INF-002 — database seed
- FD-INF-003 — root application module
- FD-INF-004 — application bootstrap
