# Analytics Engine — Specification Index

## Overview

The Analytics Engine is a multi-tenant SaaS platform for data visualization and analytics.
It provides a NestJS 11 API backend, a Next.js 15 frontend, and a shared utility package,
all managed in a pnpm/Turborepo monorepo.

## Architecture

- **API (apps/api)**: NestJS 11 with Prisma ORM, JWT authentication, row-level security
- **Web (apps/web)**: Next.js 15 App Router with server actions, Tailwind CSS
- **Shared (packages/shared)**: Common types, constants, and utility functions

## Specification Documents

| Document | Description | Status |
|----------|-------------|--------|
| [Authentication](./authentication.md) | JWT auth flow, registration, login, refresh | Complete |
| [Data Model](./data-model.md) | Prisma schema, RLS, migrations | Complete |
| [API Endpoints](./api-endpoints.md) | REST API routes and contracts | Complete |
| [Frontend](./frontend.md) | Next.js pages, components, server actions | Complete |
| [Infrastructure](./infrastructure.md) | Docker, CI/CD, deployment | Complete |
| [Security](./security.md) | Helmet, CORS, throttling, input validation | Complete |
| [Monitoring](./monitoring.md) | Health checks, metrics, logging | Complete |
| [Edge Cases](./edge-cases.md) | Error handling, boundary conditions | Complete |
| [Dashboards](./dashboards.md) | Dashboard CRUD and data aggregation | Complete |
| [Widgets](./widgets.md) | Widget types, data rendering | Complete |
| [Data Sources](./data-sources.md) | External data connections, sync | Complete |
| [Sync History](./sync-history.md) | Sync tracking and audit trail | Complete |

## Domain Entities

1. **User** — Tenant-scoped authentication identity
2. **Dashboard** — Container for widgets, owned by a user within a tenant
3. **Widget** — Visual component (chart, table, metric, text) on a dashboard
4. **DataSource** — External data connection (PostgreSQL, MySQL, CSV, API)
5. **SyncHistory** — Record of data source synchronization events
6. **AuditLog** — Immutable record of system events

## Key Design Decisions

- Row Level Security (RLS) enforced at the database level for tenant isolation
- bcryptjs with 12 salt rounds for password hashing
- JWT access tokens (15m) and refresh tokens (7d)
- ThrottlerModule with limit >= 20000 for production throughput
- All DTOs use @MaxLength() validation; UUIDs use @MaxLength(36)
- ValidationPipe with forbidNonWhitelisted: true rejects unknown fields
- ESLint 9 flat config for consistent code quality
- Prisma @@map and @map for snake_case database naming

## VERIFY Tags

All specifications contain VERIFY tags for automated scoring validation.
Each VERIFY tag is prefixed with a unique identifier for traceability.

## Cross-Cutting Concerns

- Correlation IDs on every request via CorrelationInterceptor
- Response time tracking via ResponseTimeInterceptor
- Global exception filter with structured error responses
- Pagination with clampPagination utility from shared package
- Tenant context injection via PrismaService.setTenantContext
