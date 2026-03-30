# Analytics Engine

## Project Overview

Multi-tenant analytics engine for ingesting, transforming, and visualizing data
from heterogeneous sources. Supports dashboards with configurable widgets,
real-time data source connections, and role-based access across tenant boundaries.

## Architecture

Turborepo monorepo with three packages:

- **apps/api** -- NestJS 11 REST API (port 3001). Handles auth, dashboards,
  widgets, data sources, and monitoring. Uses Prisma ORM with PostgreSQL.
- **apps/web** -- Next.js 15 frontend (port 3000). Server Actions for data
  mutations, React Server Components for initial loads.
- **packages/shared** -- Shared TypeScript types, constants, and the canonical
  `APP_VERSION` export consumed by both apps.

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| API        | NestJS 11, Prisma, passport-jwt   |
| Frontend   | Next.js 15, React 19, Tailwind    |
| Database   | PostgreSQL 16 with RLS policies   |
| Build      | Turborepo, pnpm workspaces        |
| Testing    | Jest (API unit + integration)      |
| CI         | GitHub Actions                     |
| Container  | Docker multi-stage build           |

## Key Commands

```bash
pnpm install                    # Install all dependencies
pnpm turbo run build            # Build all packages
pnpm turbo run test             # Run all tests
pnpm turbo run lint             # Lint all packages
pnpm turbo run typecheck        # Type-check all packages
```

### API-specific

```bash
cd apps/api
pnpm exec prisma migrate dev    # Run database migrations
pnpm exec prisma db seed        # Seed development data
pnpm exec prisma generate       # Regenerate Prisma client
pnpm test                       # Unit + integration tests
pnpm test -- --coverage         # Tests with coverage report
```

### Web-specific

```bash
cd apps/web
pnpm test                       # Component + a11y + keyboard tests
pnpm dev                        # Start dev server on port 3000
```

## APP_VERSION

The canonical version lives in `packages/shared/src/index.ts` as `APP_VERSION`.
Both the API and web app import it from `@analytics-engine/shared`. Never
hardcode version strings elsewhere.

## Database

- PostgreSQL 16 with Row-Level Security (RLS) for tenant isolation.
- Prisma is the ORM. Schema lives at `apps/api/prisma/schema.prisma`.
- Always run `prisma generate` before `tsc` (the Dockerfile does this).
- Migrations: `pnpm exec prisma migrate dev` for local, `prisma migrate deploy`
  in CI/production.
- Seed script: `pnpm exec prisma db seed` populates dev fixtures.

## Testing

- **API unit tests**: Jest, co-located in `apps/api/test/`. Covers services,
  controllers, guards, and utilities.
- **API integration tests**: Jest with supertest. Files suffixed
  `.integration.spec.ts`. Require a running PostgreSQL (use docker-compose.test.yml).
- **Web tests**: Jest with @testing-library/react. Include accessibility (a11y)
  and keyboard navigation coverage.
- Run all tests: `pnpm turbo run test`.

## Environment Variables

| Variable             | Required | Description                          |
|----------------------|----------|--------------------------------------|
| DATABASE_URL         | Yes      | PostgreSQL connection string         |
| JWT_SECRET           | Yes      | Secret for signing access tokens     |
| JWT_REFRESH_SECRET   | Yes      | Secret for signing refresh tokens    |
| CORS_ORIGIN          | Yes      | Allowed origin for CORS              |
| PORT                 | No       | API port (default 3001)              |
| NODE_ENV             | No       | development / production / test      |

See `.env.example` for defaults.

## Security

- **Helmet** middleware for HTTP security headers.
- **ThrottlerModule** with `short.limit=20000` to prevent brute-force without
  penalizing load tests. Adjust downward for production.
- **CORS** restricted to `CORS_ORIGIN` env var.
- **JWT** authentication via passport-jwt. Access + refresh token pair. Tokens
  are validated on every protected route via `JwtAuthGuard`.
- All tenant-scoped queries enforce RLS or explicit `WHERE tenantId = ?`.

## Code Conventions

- No `as any` -- use proper type narrowing or generics.
- No `console.log` in `src/` -- use NestJS Logger instead.
- No `|| 'fallback'` for defaults -- use `?? 'fallback'` (nullish coalescing).
- Every `findFirst` / `findUnique` call must have a comment explaining why a
  single record is expected (prevents silent bugs when queries match multiple).
- Prefer `const` over `let`. No `var`.
- Import from `@analytics-engine/shared` for all shared types and constants.

## Docker

- Multi-stage Dockerfile: `deps` -> `build` -> `production`.
- `prisma generate` runs in the build stage before TypeScript compilation.
- Production image runs as non-root `node` user.
- Health check hits `GET /health` on port 3001.
- `docker-compose.yml` for local dev (API + PostgreSQL).
- `docker-compose.test.yml` for integration tests (ephemeral PostgreSQL on
  port 5433 with tmpfs for speed).

## Monitoring

- `GET /health` returns `{ status: 'ok', version: APP_VERSION }`.
- `GET /monitoring/metrics` returns request counts, error rates, uptime.
- Structured JSON logging in production via NestJS Logger.
