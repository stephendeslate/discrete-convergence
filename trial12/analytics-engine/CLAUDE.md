# Analytics Engine — CED Trial 12

## Project Overview

Analytics Engine is a business analytics platform for creating dashboards, managing data sources,
configuring widgets, and executing queries. Built as part of the discrete-convergence experiment
(Trial 12) using CED methodology v1.3-dc across all 10 layers.

**Version:** 1.0.0 (matches APP_VERSION from shared package)
**Domain:** Business Analytics — dashboards, widgets, data sources, query execution

## Architecture

Turborepo monorepo with pnpm workspaces:

```
analytics-engine/
  apps/
    api/     — NestJS 11 REST API with Prisma ORM
    web/     — Next.js 15 frontend with React 19
  packages/
    shared/  — Shared constants, utilities, types
  specs/     — 8 specification documents with VERIFY tags
```

## Tech Stack

- **Backend:** NestJS 11, Prisma 6, PostgreSQL 16
- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Auth:** JWT + bcryptjs (salt rounds 12)
- **Monitoring:** Pino structured logging, correlation IDs
- **Security:** Helmet CSP, ThrottlerModule, CORS, ValidationPipe
- **Testing:** Jest, Supertest, jest-axe, Testing Library

## Domain Entities

- **User** — email, password, name, role (ADMIN/USER/VIEWER), tenantId
- **Dashboard** — name, description, status (DRAFT/PUBLISHED/ARCHIVED), widgets
- **Widget** — name, type (BAR_CHART/LINE_CHART/PIE_CHART/TABLE/KPI/SCATTER_PLOT), config, position
- **DataSource** — name, type (POSTGRESQL/MYSQL/REST_API/CSV), status (ACTIVE/INACTIVE/ERROR/CONNECTING)
- **QueryExecution** — query text, execution time, row count, cost (Decimal)

## Key Design Decisions

1. **Global auth guard:** JwtAuthGuard as APP_GUARD — domain controllers do NOT use @UseGuards
2. **@Public() decorator** exempts auth/login, auth/register, health, health/ready, metrics
3. **Monitoring controller** — all methods @Public() since health/metrics are system-wide
4. **GlobalExceptionFilter** as APP_FILTER — sanitizes errors, includes correlationId, no stack traces
5. **ResponseTimeInterceptor** as APP_INTERCEPTOR — X-Response-Time on all responses
6. **ThrottlerGuard** as APP_GUARD — default (100/min) + auth (5/min)
7. **RolesGuard** as APP_GUARD — checks @Roles() metadata
8. **Tenant isolation** — all controllers extract tenantId from req.user, RLS policies on all tables
9. **Pagination** — clamp to MAX_PAGE_SIZE (100), Cache-Control on list endpoints
10. **bcryptjs** — pure JS, no native deps, eliminates tar vulnerability chain

## Code Conventions

- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallbacks (use `??`)
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All `findFirst` in service files have justification comments
- TRACED tags only in .ts/.tsx files
- ESLint 9 flat config (eslint.config.mjs)

## Testing Strategy

- **Unit tests:** Service specs with mocked Prisma, behavioral assertions (toHaveBeenCalledWith)
- **Integration tests:** Supertest with real AppModule compilation, auth/dashboard/cross-layer
- **Security tests:** Auth failures, role enforcement, validation, no stack trace leaks
- **Performance tests:** Response time headers, pagination, cache-control
- **Monitoring tests:** Health endpoints, readiness, metrics, correlation IDs
- **Accessibility tests:** jest-axe on real pages, keyboard navigation with userEvent
- **Assertion density:** >= 2 expects per test block

## Environment Variables

Required:
- `DATABASE_URL` — PostgreSQL connection string with `connection_limit`
- `JWT_SECRET` — JWT signing secret
- `CORS_ORIGIN` — Allowed CORS origin

Optional:
- `PORT` — API port (default 3000)
- `API_URL` — Backend URL for frontend (default http://localhost:3001)
- `NODE_ENV` — Environment mode

## Commands

```bash
pnpm install          # Install dependencies
pnpm turbo run build  # Build all packages
pnpm turbo run test   # Run all tests
pnpm turbo run lint   # Lint all packages
pnpm tsc --noEmit     # Type check
pnpm audit            # Security audit
```

## VERIFY/TRACED Conventions

- Prefix: AE (Analytics Engine)
- Format: `VERIFY: AE-{DOMAIN}-{NNN}` / `TRACED: AE-{DOMAIN}-{NNN}`
- Domains: AUTH, DASH, WIDGET, DS, QUERY, MON, SEC, PERF, UI, AX, FI, CROSS, INFRA, DATA
- TRACED only in .ts/.tsx files
- Every VERIFY has a matching TRACED and vice versa
