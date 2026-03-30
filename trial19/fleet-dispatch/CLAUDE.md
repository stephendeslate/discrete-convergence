# Fleet Dispatch — CLAUDE.md

## Project Overview

Fleet Dispatch (FD) is a multi-tenant fleet and vehicle dispatch management system built as part of the discrete-convergence experiment (Trial 19). It follows the CED Methodology v1.7-dc with 14 mandatory gates.

## Tech Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Backend**: NestJS 11 with Prisma ORM (>=6.0.0 <7.0.0)
- **Frontend**: Next.js 15 with App Router, shadcn/ui components
- **Database**: PostgreSQL 16 with Row Level Security
- **Auth**: JWT with bcryptjs (pure JS, not bcrypt)
- **Logging**: Pino structured JSON logging
- **Testing**: Jest with supertest, jest-axe, @testing-library

## Project Structure

```
fleet-dispatch/
  apps/
    api/           # NestJS 11 backend
      src/
        auth/      # JWT authentication, login/register
        common/    # Guards, interceptors, middleware, decorators
        dashboard/ # Placeholder controller (auth-guarded)
        data-source/ # Placeholder controller (auth-guarded)
        dispatch/  # Dispatch CRUD
        driver/    # Driver CRUD
        infra/     # Prisma service/module
        monitoring/ # Health, ready, metrics
        route/     # Route CRUD
        vehicle/   # Vehicle CRUD
      test/        # Integration tests
      prisma/      # Schema, migrations, seed
    web/           # Next.js 15 frontend
      app/         # App Router pages
      components/  # Nav + shadcn/ui components
      lib/         # Server actions, utilities
      __tests__/   # Accessibility and keyboard tests
  packages/
    shared/        # Constants, pagination, logging, correlation
  specs/           # CED specification documents
```

## Key Commands

```bash
pnpm install          # Install all dependencies
pnpm run build        # Build all packages (turbo)
pnpm run test         # Run all tests (turbo)
pnpm run lint         # Lint all packages (turbo)
pnpm run typecheck    # Type check all packages (turbo)
pnpm run dev          # Start dev servers (turbo)
```

### API-specific
```bash
cd apps/api
npx prisma generate   # Generate Prisma client
npx prisma migrate deploy  # Run migrations
npx prisma db seed    # Seed database
pnpm test             # Run API tests
```

## Architecture Decisions

### Authentication
- JWT tokens contain userId, email, role, tenantId
- @Public() decorator exempts endpoints from JWT guard
- @Throttle({ short: { ttl: 1000, limit: 3 } }) on login/register
- Health/metrics endpoints are public but NOT @SkipThrottle

### Tenant Isolation
- Every query filters by tenantId from JWT payload
- PostgreSQL RLS with ENABLE + FORCE + CREATE POLICY
- TEXT comparison in RLS policies (no ::uuid cast)
- $executeRaw with Prisma.sql for SET LOCAL tenant context

### Security Headers
- x-powered-by disabled FIRST (before Helmet)
- Helmet CSP with frame-ancestors: 'none'
- CORS with configurable origin via CORS_ORIGIN env var
- ValidationPipe: whitelist + forbidNonWhitelisted + transform

### Monitoring
- X-Correlation-ID middleware (crypto.randomUUID)
- X-Response-Time interceptor
- Pino structured logging with sanitized context
- Health endpoint with APP_VERSION from shared

## Zero Tolerance Rules

These patterns are forbidden in the codebase:
- `as any` — no type escape hatches
- `console.log` in apps/api/src/ — use pino logger
- `||` for env var fallbacks — use `??` (nullish coalescing)
- `$executeRawUnsafe` — use `$executeRaw` with Prisma.sql
- `dangerouslySetInnerHTML` — no raw HTML injection

## Traceability

- 40 VERIFY/TRACED tag pairs with FD-{DOMAIN}-{NNN} format
- VERIFY tags in specs/*.md files only
- TRACED tags in .ts/.tsx source files only
- 100% bidirectional parity, zero orphans

## Test Organization

- Co-located unit tests: `src/**/*.spec.ts` (service logic, guards)
- Integration tests: `test/*.spec.ts` (supertest, AppModule)
- Frontend tests: `__tests__/*.spec.tsx` (jest-axe, keyboard nav)
- Shared tests: `packages/shared/__tests__/*.spec.ts`
