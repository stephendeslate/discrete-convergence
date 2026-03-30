# Analytics Engine — Specification Index

## Overview

The Analytics Engine is a multi-tenant analytics platform built as a monorepo
using Turborepo with pnpm workspaces. It comprises three packages: `apps/api`
(NestJS 11 + Prisma 6 + PostgreSQL), `apps/web` (Next.js 15 + React 19),
and `packages/shared` (common types, utilities, constants).

## Specification Files

| # | File | Domain | Description |
|---|------|--------|-------------|
| 1 | [authentication.md](authentication.md) | Auth | JWT auth with bcryptjs, Passport strategy, token refresh |
| 2 | [data-model.md](data-model.md) | Data | Prisma schema, entity relationships, shared package |
| 3 | [api-endpoints.md](api-endpoints.md) | API | REST endpoints, test infrastructure, edge cases |
| 4 | [frontend.md](frontend.md) | Web | Next.js pages, components, server actions, API client |
| 5 | [infrastructure.md](infrastructure.md) | Infra | Docker, CI, environment config, monorepo structure |
| 6 | [security.md](security.md) | Security | RLS, RBAC, Helmet, rate limiting, tenant guard |
| 7 | [monitoring.md](monitoring.md) | Ops | Health checks, metrics, logging, bootstrap |
| 8 | [dashboards.md](dashboards.md) | Domain | Dashboard CRUD with ownership enforcement |
| 9 | [widgets.md](widgets.md) | Domain | Widget management within dashboards |
| 10 | [data-sources.md](data-sources.md) | Domain | External data source connections |
| 11 | [sync-history.md](sync-history.md) | Domain | Sync operation tracking and history |
| 12 | [audit-logs.md](audit-logs.md) | Domain | Immutable audit trail, pagination utilities |

## Domain Model

Six entities plus User:
- **User** — Authentication subject with role-based access (ADMIN, EDITOR, VIEWER)
- **Dashboard** — Container for widgets, owned by a user, scoped to tenant
- **Widget** — Visualization component within a dashboard
- **DataSource** — External connection configuration
- **SyncHistory** — Record of data synchronization operations
- **AuditLog** — Immutable audit trail of all mutations

## API Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Authenticate user |
| POST | /auth/refresh | Yes | Refresh token pair |
| GET | /dashboards | Yes | List dashboards (paginated) |
| POST | /dashboards | Yes | Create dashboard |
| GET | /dashboards/:id | Yes | Get dashboard with widgets |
| PUT | /dashboards/:id | Yes | Update dashboard |
| DELETE | /dashboards/:id | Yes | Delete dashboard |
| GET | /widgets/dashboard/:id | Yes | List widgets for dashboard |
| POST | /widgets | Yes | Create widget |
| GET | /widgets/:id | Yes | Get widget by ID |
| PUT | /widgets/:id | Yes | Update widget |
| DELETE | /widgets/:id | Yes | Delete widget |
| GET | /data-sources | Yes | List data sources |
| POST | /data-sources | Yes | Create data source |
| GET | /data-sources/:id | Yes | Get data source |
| PUT | /data-sources/:id | Yes | Update data source |
| DELETE | /data-sources/:id | Yes | Delete data source |
| GET | /sync-histories/data-source/:id | Yes | List sync history |
| GET | /sync-histories/:id | Yes | Get sync record |
| POST | /sync-histories/data-source/:id/trigger | Yes | Trigger sync |
| GET | /audit-logs | Yes | List audit logs |
| GET | /health | No | Liveness check |
| GET | /health/ready | No | Readiness check |
| GET | /health/metrics | No | Application metrics |

## Cross-Cutting Concerns

- **Authentication**: JWT with access (15m) and refresh (7d) tokens — see [authentication.md](authentication.md)
- **Tenant Isolation**: PostgreSQL RLS on all tables — see [security.md](security.md)
- **Pagination**: Shared utilities across all list endpoints — see [audit-logs.md](audit-logs.md)
- **Correlation**: X-Correlation-ID on every request — see [security.md](security.md)
- **Logging**: Pino structured JSON — see [monitoring.md](monitoring.md)
- **Validation**: class-validator on all DTOs — see [security.md](security.md)

## Technical Decisions

- **bcryptjs** over bcrypt for cross-platform compatibility (BCRYPT_SALT_ROUNDS=12)
- **JWT dual-token**: access (15m) + refresh (7d) for session management
- **ThrottlerModule limit=20000** to handle load testing
- **Pino structured logging** with conditional pretty-printing in development
- **PostgreSQL RLS** for tenant isolation at the database level
- **ESLint 9 flat config** (eslint.config.mjs)
