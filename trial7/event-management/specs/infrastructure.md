# Infrastructure Specification

## Overview

The Event Management platform is containerized with Docker, uses PostgreSQL 16,
and runs CI/CD via GitHub Actions. The monorepo is managed by Turborepo with pnpm
workspaces.

See also: [monitoring.md](monitoring.md) for health check endpoints.
See also: [security.md](security.md) for audit and CSP configuration.

## Bootstrap and Environment

- VERIFY: EM-INFRA-001 — main.ts calls validateEnvVars from shared to validate
  DATABASE_URL, JWT_SECRET, CORS_ORIGIN at startup before NestFactory.create

## Seed Script

- VERIFY: EM-INFRA-002 — prisma/seed.ts creates demo tenant, admin/organizer/user
  with bcrypt hash using BCRYPT_SALT_ROUNDS from shared, error/failure state data
  (cancelled event), and main()/disconnect pattern with process.exit(1) error handling

## Docker Configuration

- VERIFY: EM-INFRA-003 — Dockerfile uses multi-stage build (deps, build, production),
  node:20-alpine base, USER node, HEALTHCHECK, LABEL maintainer, COPYs turbo.json

## Architecture

### Monorepo Structure
```
event-management/
  apps/api/       — NestJS backend
  apps/web/       — Next.js frontend
  packages/shared/ — Shared utilities
  turbo.json      — Build orchestration
  pnpm-workspace.yaml — Workspace config
```

### Docker

- Dockerfile: Multi-stage (deps -> build -> production)
- Base image: node:20-alpine
- USER node (non-root)
- HEALTHCHECK via wget to /health
- LABEL maintainer
- COPYs turbo.json in deps stage

### Docker Compose

- PostgreSQL 16 with healthcheck and named volume
- API service depends on healthy DB
- DATABASE_URL includes connection_limit=10
- Test compose uses separate DB on port 5433

### CI/CD Pipeline (GitHub Actions)

Steps:
1. Checkout code
2. Setup pnpm + Node.js 20
3. Install dependencies (frozen lockfile)
4. Lint (pnpm turbo run lint)
5. Typecheck (pnpm turbo run typecheck)
6. Test (pnpm turbo run test)
7. Build (pnpm turbo run build)
8. Migration check (prisma migrate diff)
9. Dependency audit (pnpm audit --audit-level=high)

PostgreSQL 16 service container with health check.

### Environment Variables

Required:
- DATABASE_URL — PostgreSQL connection with connection_limit
- JWT_SECRET — JWT signing key
- CORS_ORIGIN — Allowed CORS origin

Optional:
- PORT (default 3000)
- LOG_LEVEL (default info)
- API_URL (frontend backend URL)

### Shared Package Exports

The @event-management/shared package exports >= 8 utilities:
1. APP_VERSION — Application version constant
2. BCRYPT_SALT_ROUNDS — bcrypt salt rounds (12)
3. ALLOWED_REGISTRATION_ROLES — Roles for self-registration
4. MAX_PAGE_SIZE — Maximum pagination size (100)
5. DEFAULT_PAGE_SIZE — Default pagination size (20)
6. createCorrelationId — UUID generator for request tracing
7. sanitizeLogContext — Recursive log sanitizer
8. formatLogEntry — Structured log formatter
9. validateEnvVars — Environment variable validator
10. clampPagination — Pagination parameter clamper

### ORM Version Pinning

Prisma is pinned with ">=6.0.0 <7.0.0" range in package.json to prevent
unexpected breaking changes from major version upgrades.

### turbo in root devDependencies

The root package.json includes turbo in devDependencies (not just referenced
in scripts) to ensure consistent version across the workspace.
