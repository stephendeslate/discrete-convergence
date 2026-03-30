# Infrastructure Specification

## Overview

Fleet Dispatch uses Docker for containerization, GitHub Actions for CI/CD,
and Turborepo for monorepo build orchestration. The database is PostgreSQL 16
with Prisma migrations. See [data-model.md](data-model.md) for schema details.

## Shared Constants

- VERIFY: FD-INFRA-001 — APP_VERSION constant exported from shared package
- VERIFY: FD-INFRA-002 — validateEnvVars() validates required environment variables at startup
- VERIFY: FD-INFRA-003 — Bootstrap configures Helmet, CORS, ValidationPipe with env validation
- VERIFY: FD-INFRA-004 — Seed script creates demo data with error handling and BCRYPT_SALT_ROUNDS from shared

## Docker

### Dockerfile
- Multi-stage build: deps -> build -> production
- Base image: node:20-alpine
- USER node for security
- HEALTHCHECK via wget to /health
- LABEL maintainer for image metadata
- COPYs turbo.json in deps stage

### Docker Compose
- PostgreSQL 16 with healthcheck
- Named volume for data persistence
- Test variant on separate port

## CI/CD Pipeline

GitHub Actions workflow with jobs:
1. lint — pnpm turbo run lint
2. typecheck — pnpm turbo run typecheck
3. test — pnpm turbo run test (with PostgreSQL service)
4. build — pnpm turbo run build
5. migration-check — verify migration files exist
6. audit — pnpm audit --audit-level=high

## Prisma Migrations

- Initial migration creates all tables with proper types
- Row Level Security enabled and forced on all tables
- Indexes on foreign keys, status fields, and composites
- Enums mapped to snake_case with @map on values

## Seed Script

- Creates demo tenant with admin and dispatcher users
- Creates vehicles (including retired/failure state)
- Creates drivers (including terminated/failure state)
- Creates routes (including cancelled/failure state)
- Creates dispatches (including failed/failure state)
- Creates maintenance records
- Error handling: console.error + process.exit(1)
- Uses BCRYPT_SALT_ROUNDS from shared (not hardcoded)

## Monorepo Structure

- Turborepo for parallel builds
- pnpm workspaces for dependency management
- turbo in root devDependencies
- Shared package with workspace:* protocol
- ORM packages pinned with >=X.0.0 <Y.0.0 ranges

## Environment Variables

### Required (validated at startup)
- DATABASE_URL — PostgreSQL connection with connection_limit
- JWT_SECRET — JWT signing key
- CORS_ORIGIN — Allowed CORS origin

### Optional
- PORT — API port (default 3000)
- LOG_LEVEL — Pino log level (default info)

## .env.example

Provided with placeholder values including connection_limit in DATABASE_URL.
