# Fleet Dispatch Specification Index

## Project Overview

Fleet Dispatch (FD) is a multi-tenant fleet and vehicle dispatch management system
built with NestJS 11 (backend), Next.js 15 (frontend), Prisma ORM, and PostgreSQL.
It supports role-based access control (ADMIN, VIEWER, DISPATCHER) and tenant isolation
at both the application and database levels.

## Domain Entities

- **Vehicles** — fleet vehicle inventory with status tracking and cost per mile
- **Routes** — origin/destination route definitions with distance and estimated time
- **Dispatches** — assignments linking vehicles, routes, and drivers with scheduling
- **Drivers** — driver records with license information, phone, and availability status
- **Users** — authentication accounts with role and tenant membership

## Specification Documents

| # | Specification | File | Description |
|---|---------------|------|-------------|
| 1 | Authentication | [authentication.md](authentication.md) | JWT auth, registration, login, refresh tokens |
| 2 | Data Model | [data-model.md](data-model.md) | Prisma schema, entities, relationships, RLS |
| 3 | API Endpoints | [api-endpoints.md](api-endpoints.md) | REST API routes, DTOs, responses |
| 4 | Frontend | [frontend.md](frontend.md) | Next.js pages, components, server actions |
| 5 | Infrastructure | [infrastructure.md](infrastructure.md) | Docker, CI/CD, deployment, configuration |
| 6 | Security | [security.md](security.md) | RBAC, tenant isolation, input validation, headers |
| 7 | Monitoring | [monitoring.md](monitoring.md) | Health checks, metrics, logging, alerting |
| 8 | Cross-Layer | [cross-layer.md](cross-layer.md) | Integration points, middleware, guards |
| 9 | Edge Cases | [edge-cases.md](edge-cases.md) | Boundary conditions, error handling, edge scenarios |
| 10 | Performance | [performance.md](performance.md) | Caching, pagination, query optimization |

## Cross-Reference Map

- Authentication references: Security (token handling), API Endpoints (auth routes)
- Data Model references: Security (RLS policies), API Endpoints (entity operations)
- Frontend references: Authentication (login/register), API Endpoints (data fetching)
- Infrastructure references: Monitoring (health checks), Security (Docker hardening)
- Security references: Authentication (JWT), Data Model (RLS), Monitoring (audit logs)
- Monitoring references: Infrastructure (deployment), API Endpoints (health routes)
- Cross-Layer references: Authentication (guards), Security (middleware), Monitoring (interceptors)
- Edge Cases references: all specifications for boundary condition coverage
- Performance references: Data Model (indexes), API Endpoints (pagination), Infrastructure (caching)

## VERIFY Tag Registry

All VERIFY tags follow the format: VERIFY: FD-{DOMAIN}-{NNN} — Description

### Authentication (FD-AUTH)
- VERIFY: FD-AUTH-001 — Login page renders with email and password fields
- VERIFY: FD-AUTH-002 — Registration page enforces allowed roles
- VERIFY: FD-AUTH-003 — Logout clears tokens from cookies
- VERIFY: FD-AUTH-004 — Input component supports accessible attributes
- VERIFY: FD-AUTH-005 — Auth service hashes passwords with bcryptjs
- VERIFY: FD-AUTH-006 — Auth controller applies rate limiting on login/register
- VERIFY: FD-AUTH-007 — Server actions include auth headers from cookies
- VERIFY: FD-AUTH-008 — Login action stores tokens in httpOnly cookies

### Vehicle (FD-VEH)
- VERIFY: FD-VEH-001 — Vehicles page displays table with status badges
- VERIFY: FD-VEH-002 — Vehicle service enforces tenant isolation
- VERIFY: FD-VEH-003 — Vehicle controller sets Cache-Control headers

### Route (FD-ROUTE)
- VERIFY: FD-ROUTE-001 — Routes page displays table with distance
- VERIFY: FD-ROUTE-002 — Route service enforces tenant isolation
- VERIFY: FD-ROUTE-003 — Route controller enforces ADMIN role for deletion

### Driver (FD-DRV)
- VERIFY: FD-DRV-001 — Drivers page displays table with license info
- VERIFY: FD-DRV-002 — Driver service enforces tenant isolation
- VERIFY: FD-DRV-003 — Driver controller enforces ADMIN role for deletion

### Dispatch (FD-DISP)
- VERIFY: FD-DISP-001 — Dispatches page displays table with relations
- VERIFY: FD-DISP-002 — Dispatch service includes vehicle/route/driver relations
- VERIFY: FD-DISP-003 — Dispatch controller enforces ADMIN role for deletion

### Data (FD-DATA)
- VERIFY: FD-DATA-001 — Prisma schema uses Decimal for money fields
- VERIFY: FD-DATA-002 — Raw queries use parameterized Prisma.sql template

### Security (FD-SEC)
- VERIFY: FD-SEC-001 — Button component supports variant and size props
- VERIFY: FD-SEC-002 — Accessibility tests validate ARIA attributes
- VERIFY: FD-SEC-003 — Utility cn function merges Tailwind classes
- VERIFY: FD-SEC-004 — Layout includes lang attribute and metadata
- VERIFY: FD-SEC-005 — Roles guard checks RBAC before handler execution
- VERIFY: FD-SEC-006 — Global exception filter sanitizes error context

### Monitoring (FD-MON)
- VERIFY: FD-MON-001 — Correlation ID middleware generates unique IDs
- VERIFY: FD-MON-002 — Request logging middleware uses pino
- VERIFY: FD-MON-003 — Response time interceptor measures duration
- VERIFY: FD-MON-004 — Structured logging sanitizes sensitive fields
- VERIFY: FD-MON-005 — Log sanitizer handles nested objects and arrays
- VERIFY: FD-MON-006 — Pagination utility clamps page and limit values
- VERIFY: FD-MON-007 — Health endpoint returns status and version
- VERIFY: FD-MON-008 — Metrics endpoint exposes request counts

### Performance (FD-PERF)
- VERIFY: FD-PERF-001 — Keyboard navigation tests validate focus management
- VERIFY: FD-PERF-002 — Health check responds within 200ms
- VERIFY: FD-PERF-003 — Cache-Control headers set on list endpoints
- VERIFY: FD-PERF-004 — Concurrent requests handled without errors
- VERIFY: FD-PERF-005 — Pagination parameters parsed correctly
- VERIFY: FD-PERF-006 — Response time header included in responses
- VERIFY: FD-PERF-007 — N+1 query prevention via include on dispatches

### Infrastructure (FD-INFRA)
- VERIFY: FD-INFRA-001 — Prisma service connects and disconnects cleanly
- VERIFY: FD-INFRA-002 — Main bootstrap validates required env vars

### Cross-Layer (FD-CROSS)
- VERIFY: FD-CROSS-001 — Dashboard controller returns empty array with tenant context
- VERIFY: FD-CROSS-002 — DataSource controller returns empty array with tenant context
- VERIFY: FD-CROSS-003 — App module registers all guards, filters, interceptors
