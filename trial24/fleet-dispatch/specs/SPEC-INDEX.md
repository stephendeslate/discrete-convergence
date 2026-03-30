# Fleet Dispatch — Specification Index

## Overview

Fleet Dispatch is a multi-tenant fleet management platform enabling companies
to manage vehicles, drivers, routes, dispatches, trips, maintenance records,
and geographic zones. Built as a monorepo with Turborepo, NestJS API,
Next.js frontend, and shared packages.

## Architecture

- **API**: NestJS 11 + Prisma 6 + PostgreSQL 16 with Row-Level Security
- **Web**: Next.js 15 + React 19 + Tailwind CSS
- **Shared**: Common constants and utilities

## Tenant Isolation

All data is scoped by `companyId`. PostgreSQL RLS policies enforce isolation
at the database level using the `app.company_id` session variable.

## Specification Files

| # | Spec File | Domain | Description |
|---|-----------|--------|-------------|
| 1 | [authentication.md](authentication.md) | Auth | JWT auth, bcryptjs, Passport strategy |
| 2 | [data-model.md](data-model.md) | Data | Prisma schema, entities, shared package, zones |
| 3 | [api-endpoints.md](api-endpoints.md) | API | REST endpoints, request/response conventions |
| 4 | [frontend.md](frontend.md) | Web | Next.js pages, components, server actions |
| 5 | [infrastructure.md](infrastructure.md) | Infra | Docker, CI, environment, monorepo |
| 6 | [security.md](security.md) | Security | RLS, Helmet, rate limiting, tenant guard |
| 7 | [monitoring.md](monitoring.md) | Ops | Health checks, bootstrap, app module |
| 8 | [vehicles.md](vehicles.md) | Domain | Vehicle CRUD with status management |
| 9 | [drivers.md](drivers.md) | Domain | Driver CRUD with availability |
| 10 | [routes.md](routes.md) | Domain | Route CRUD with distance/time |
| 11 | [dispatches.md](dispatches.md) | Domain | Dispatch workflow and assignment |
| 12 | [trips.md](trips.md) | Domain | Trip records with fuel/distance |
| 13 | [maintenance.md](maintenance.md) | Domain | Vehicle maintenance tracking |

## API Endpoints Summary

- `POST /auth/register` — Register (default VIEWER)
- `POST /auth/login` — Login, returns access + refresh tokens
- `POST /auth/refresh` — Refresh access token
- `GET /health` — Liveness probe
- `GET /health/ready` — Readiness probe (checks DB)
- Vehicles: GET/POST/GET/:id/PATCH/:id/DELETE/:id
- Drivers: GET/POST/GET/:id/PATCH/:id/DELETE/:id
- Routes: GET/POST/GET/:id/PATCH/:id/DELETE/:id
- Dispatches: GET/POST/GET/:id/PATCH/:id/DELETE/:id
- Trips: GET/POST/GET/:id/PATCH/:id
- Maintenance: GET/POST/GET/:id/PATCH/:id/DELETE/:id
- Zones: GET/POST/GET/:id/PATCH/:id/DELETE/:id

## Cross-Cutting Concerns

- **Authentication**: JWT with access (15m) and refresh (7d) tokens — see [authentication.md](authentication.md)
- **Authorization**: Role-based (ADMIN, EDITOR, VIEWER) — see [security.md](security.md)
- **Validation**: class-validator on all DTOs — see [security.md](security.md)
- **Logging**: Pino structured JSON with correlation IDs — see [monitoring.md](monitoring.md)
- **Rate Limiting**: ThrottlerModule with limit=20000 — see [security.md](security.md)
- **Security**: Helmet with CSP, bcryptjs with 12 rounds — see [security.md](security.md)
- **Pagination**: Offset pagination, max 100 per page — see [security.md](security.md)

## Technical Decisions

- **bcryptjs** over bcrypt for cross-platform compatibility
- **JWT dual-token**: access (15m) + refresh (7d)
- **companyId** as tenant key (not tenantId)
- **PostgreSQL RLS** for tenant isolation at database level
- **ESLint 9 flat config** (eslint.config.mjs)
- **ThrottlerModule limit=20000** for load testing support
