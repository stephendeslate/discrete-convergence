# Infrastructure Specification

## Overview

The Event Management platform uses a Turborepo monorepo with pnpm workspaces. Infrastructure includes Docker containerization, PostgreSQL with Row Level Security, CI/CD via GitHub Actions, and environment validation at startup.

See also: [Data Model](data-model.md) for schema details, [Monitoring](monitoring.md) for health checks.

## Environment and Configuration

VERIFY: EM-INFRA-001
validateEnvVars() validates required environment variables at application startup. Throws descriptive errors listing all missing variables rather than failing on the first missing one.

VERIFY: EM-INFRA-002
PrismaService extends PrismaClient with onModuleInit() for connection lifecycle management. Registered as a global module via PrismaModule so all feature modules share a single Prisma instance.

VERIFY: EM-INFRA-003
main.ts bootstrap sequence: validateEnvVars(), helmet with CSP, enableCors with CORS_ORIGIN, global ValidationPipe (whitelist, forbidNonWhitelisted, transform), listen on PORT.

VERIFY: EM-INFRA-004
Prisma seed script creates initial data: admin/organizer/user accounts with bcryptjs hashed passwords using BCRYPT_SALT_ROUNDS from shared, sample venue, published + cancelled events, schedule, tickets (available + cancelled), and attendee.

## Shared Package

VERIFY: EM-SHARED-001
APP_VERSION constant exported from shared package. Used by monitoring health endpoint to report deployed version.

VERIFY: EM-SHARED-002
BCRYPT_SALT_ROUNDS constant (12) exported from shared. Used by auth service for password hashing and by seed script.

VERIFY: EM-SHARED-003
MAX_PAGE_SIZE constant (100) exported from shared. Used by clampPageSize() to prevent excessively large queries.

VERIFY: EM-SHARED-004
DEFAULT_PAGE_SIZE constant (20) exported from shared. Fallback when no page size is specified in paginated requests.

VERIFY: EM-SHARED-005
Shared package index.ts re-exports all utilities: constants (APP_VERSION, BCRYPT_SALT_ROUNDS, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, ALLOWED_REGISTRATION_ROLES, SENSITIVE_KEYS), createCorrelationId, formatLogEntry, LogEntry, sanitizeLogContext, validateEnvVars, clampPageSize, calculateSkip. Minimum 8 exports.

## Docker

Multi-stage Dockerfile:
1. **deps** stage: node:20-alpine, copies package.json/pnpm-lock.yaml/turbo.json, runs pnpm install --frozen-lockfile
2. **build** stage: copies source, runs turbo build
3. **production** stage: copies built output, sets USER node, includes HEALTHCHECK, exposes PORT

docker-compose.yml provides PostgreSQL 16 with:
- Health check (pg_isready)
- Named volume for data persistence
- Environment variables from .env

docker-compose.test.yml adds test-specific overrides.

## CI/CD

GitHub Actions workflow (.github/workflows/ci.yml):
- PostgreSQL 16 service container with health check
- Steps: checkout, pnpm setup, install, lint, typecheck, build, test, migration check, audit
- Runs on push to main and pull requests

## Monorepo Structure

```
event-management/
  apps/
    api/        # NestJS 11 API
    web/        # Next.js 15 frontend
  packages/
    shared/     # Cross-cutting utilities
  turbo.json    # Task pipeline (build, lint, test, typecheck)
  pnpm-workspace.yaml
```

Turborepo task dependencies:
- `build` depends on `^build` (topological)
- `test` depends on `^build`
- `lint` and `typecheck` run independently
