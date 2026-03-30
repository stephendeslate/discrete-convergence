# Infrastructure Specification

## Overview

The Event Management platform uses Docker for containerization,
GitHub Actions for CI/CD, Prisma for database migrations, and
Turborepo for monorepo management.

## Docker

The Dockerfile uses a multi-stage build:
1. **deps** — Install dependencies with pnpm
2. **build** — Compile TypeScript with turbo
3. **production** — Minimal runtime image

Requirements:
- Base image: `node:20-alpine`
- `USER node` for non-root execution
- `HEALTHCHECK` for container health monitoring
- `LABEL maintainer` for identification

## Database

- PostgreSQL 16 with Alpine variant
- Named volume for data persistence
- Health check via `pg_isready`
- `connection_limit` in DATABASE_URL for connection pooling

## Seed

<!-- VERIFY:EM-INFRA-001 — Seed uses BCRYPT_SALT_ROUNDS from shared, includes error state data -->
The seed script:
- Uses `BCRYPT_SALT_ROUNDS` from the shared package
- Creates organizations, users, venues, events, registrations
- Includes error state data (cancelled events, cancelled registrations)
- Implements `main()` pattern with `$disconnect()`
- Has error handling with `console.error` + `process.exit(1)`

## CI/CD Pipeline

<!-- VERIFY:EM-INFRA-002 — CI pipeline with lint, test, build, typecheck, migration-check, audit -->
GitHub Actions workflow includes:
- **lint** — Run linting across all packages
- **typecheck** — TypeScript type checking
- **test** — Run tests with PostgreSQL service container
- **build** — Build all packages
- **migration-check** — Verify Prisma migrations apply cleanly
- **audit** — `pnpm audit --audit-level=high`

## Monorepo Structure

```
event-management/
  apps/api/       — NestJS backend
  apps/web/       — Next.js frontend
  packages/shared/ — Shared utilities
```

Managed by Turborepo with pnpm workspaces.
`turbo` is listed in root `devDependencies`.
Both apps import from shared using `workspace:*` protocol.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | JWT signing secret |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| PORT | No | API port (default 3001) |
| API_URL | No | API base URL for frontend |

## Prisma Version Pinning

<!-- VERIFY:EM-INFRA-003 — Prisma pinned with >=6.0.0 <7.0.0 range -->
Prisma packages are pinned with `">=6.0.0 <7.0.0"` semver range
to prevent breaking major version updates.
