# Infrastructure Specification

## Overview

Fleet Dispatch uses a containerized deployment architecture with
Docker multi-stage builds, PostgreSQL 16, and GitHub Actions CI/CD.
The monorepo is managed with Turborepo and pnpm workspaces.

## Environment Configuration

<!-- VERIFY: FD-INFRA-001 -->
The APP_VERSION constant is exported from the shared package and
used for health check responses and API versioning.

<!-- VERIFY: FD-INFRA-002 -->
The `validateEnvVars()` function from the shared package validates
that all required environment variables are present at startup.
It throws a descriptive error listing missing variables.

<!-- VERIFY: FD-INFRA-003 -->
The API main.ts bootstrap function calls `validateEnvVars()` with
`['JWT_SECRET', 'DATABASE_URL']` before creating the NestJS application.
Helmet, CORS, and ValidationPipe are configured during bootstrap.

## Docker Configuration

The Dockerfile uses a multi-stage build:
1. **deps** stage: node:20-alpine, copies package.json files, turbo.json,
   pnpm-workspace.yaml, runs pnpm install --frozen-lockfile
2. **build** stage: copies source, runs pnpm turbo run build
3. **production** stage: copies dist, sets USER node, adds HEALTHCHECK
   and LABEL maintainer metadata

The `.dockerignore` excludes node_modules, .next, dist, .git, .env,
coverage, and markdown files.

## Docker Compose

### Development (`docker-compose.yml`)

- PostgreSQL 16 Alpine with healthcheck (pg_isready)
- Named volume `fleet_data` for data persistence
- API service with DATABASE_URL pointing to postgres service
- `depends_on` with `condition: service_healthy`

### Testing (`docker-compose.test.yml`)

- PostgreSQL 16 Alpine on port 5433 (avoids dev port conflict)
- Test-specific credentials: fleet_test / fleet_test_pass
- Healthcheck with 5s interval

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on
push to main and pull requests targeting main:

1. PostgreSQL 16 service container with health checks
2. pnpm v9 setup via pnpm/action-setup@v4
3. Node.js 20 with pnpm cache
4. `pnpm install --frozen-lockfile`
5. `pnpm turbo run lint`
6. `pnpm turbo run typecheck`
7. `pnpm turbo run build`
8. `pnpm turbo run test`
9. Prisma migration status check (continue-on-error)
10. Security audit at high level (continue-on-error)

## Environment Variables

Required variables documented in `.env.example`:
- `DATABASE_URL` — PostgreSQL connection string with connection_limit
- `JWT_SECRET` — Secret for JWT token signing
- `CORS_ORIGIN` — Allowed CORS origin
- `NODE_ENV` — development, test, or production
- `PORT` — API server port (default 3001)
- `API_URL` — Full API base URL
- `LOG_LEVEL` — Pino log level (default info)

## Database Migrations

The initial migration creates all six domain tables with:
- UUID primary keys with gen_random_uuid() default
- Timestamp columns with CURRENT_TIMESTAMP defaults
- Proper indexes on tenantId and status columns
- Row Level Security enabled and forced on all tables
- RLS policies using TEXT comparison (no ::uuid cast)
