# Fleet Dispatch — Specification Index

## Overview

Fleet Dispatch is a multi-tenant fleet management and dispatch platform built with
NestJS 11 (backend), Next.js 15 (frontend), Prisma 6 (ORM), and PostgreSQL 16.

## Specification Documents

| # | Document | Description | VERIFY Count |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, registration, login, refresh tokens | 6 |
| 2 | [data-model.md](data-model.md) | 14 domain entities, Prisma schema, RLS policies | 8 |
| 3 | [api-endpoints.md](api-endpoints.md) | REST endpoints, pagination, tenant scoping | 6 |
| 4 | [frontend.md](frontend.md) | Next.js 15 app router, pages, components, actions | 5 |
| 5 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, database migrations, env vars | 5 |
| 6 | [security.md](security.md) | Guards, RLS, input validation, helmet, throttling | 6 |
| 7 | [monitoring.md](monitoring.md) | Health checks, logging, correlation IDs, metrics | 5 |
| 8 | [edge-cases.md](edge-cases.md) | Boundary conditions, error scenarios, race conditions | 12 |
| 9 | [cross-layer.md](cross-layer.md) | End-to-end flows across frontend and backend | 4 |

## Architecture

### Backend (apps/api)
- NestJS 11 with TypeScript strict mode
- Prisma 6 ORM with PostgreSQL
- JWT authentication with bcryptjs
- Global guards: JwtAuthGuard, ThrottlerGuard, RolesGuard
- Global filter: GlobalExceptionFilter
- Global interceptor: ResponseTimeInterceptor
- Middleware: CorrelationIdMiddleware

### Frontend (apps/web)
- Next.js 15 with App Router
- React 19 with Server Actions
- Tailwind CSS with dark mode
- 8 UI components (button, card, input, label, badge, table, dialog, skeleton)

### Shared (packages/shared)
- Constants, pagination utilities, log sanitization
- Correlation ID generation, env validation

## Domain Entities (14)
1. Tenant — Multi-tenancy root
2. User — Authentication and authorization
3. Vehicle — Fleet vehicle inventory
4. Driver — Driver management
5. Route — Route definitions with stops
6. Trip — Scheduled trips on routes
7. Stop — Route waypoints
8. Dispatch — Delivery dispatch tracking
9. MaintenanceRecord — Vehicle maintenance history
10. FuelLog — Fuel consumption tracking
11. Geofence — Geographic boundaries
12. Alert — System alerts with severity
13. Notification — User notifications
14. AuditLog — Audit trail for compliance

## Total VERIFY Tags: >= 57
## Total TRACED Tags: >= 20
