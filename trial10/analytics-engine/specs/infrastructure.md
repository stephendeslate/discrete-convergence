# Infrastructure Specification

## Overview

The Analytics Engine uses Docker for containerization, GitHub Actions for CI/CD,
and Prisma for database migrations. The monorepo is managed with Turborepo and pnpm.

See also: [Data Model](data-model.md) for database schema details.
See also: [Monitoring](monitoring.md) for health check endpoints.

## Docker

VERIFY: AE-INFRA-001
Multi-stage Dockerfile:
- deps stage: node:20-alpine, installs dependencies with pnpm
- build stage: copies deps, runs turbo build
- production stage: node:20-alpine, USER node, HEALTHCHECK, LABEL maintainer
The Dockerfile COPYs turbo.json in the deps stage for proper caching.

## CI/CD

VERIFY: AE-INFRA-002
GitHub Actions CI workflow:
- Triggers on push/PR to main branch
- Uses PostgreSQL 16 service container
- Steps: install, lint, typecheck, build, test, migration-check, audit
- Uses pnpm turbo run for all build tasks
- Runs pnpm audit --audit-level=high for security scanning

## Docker Compose

Production docker-compose.yml:
- PostgreSQL 16 with healthcheck and named volume (postgres_data)
- API service depends on postgres with healthcheck condition
- Environment variables from .env file (no hardcoded secrets)

Test docker-compose.test.yml:
- PostgreSQL 16 test instance on port 5433
- Separate database for test isolation

## Environment Variables

Required variables validated at startup via validateEnvVars():
- DATABASE_URL: PostgreSQL connection string with connection_limit
- JWT_SECRET: Secret for JWT signing
- CORS_ORIGIN: Allowed CORS origin
- NODE_ENV: Environment identifier
- PORT: API server port
- LOG_LEVEL: Pino log level
- API_URL: Backend URL for frontend fetch calls

## Monorepo Structure

Turborepo manages build orchestration:
- apps/api: NestJS backend
- apps/web: Next.js frontend
- packages/shared: Shared utilities and constants

Root package.json has turbo in devDependencies.
pnpm-workspace.yaml defines workspace packages.
pnpm.overrides includes effect>=3.20.0 for Prisma transitive fix.

## Database Migrations

Prisma migrations in apps/api/prisma/migrations/:
- Initial migration creates all tables, enums, indexes
- RLS enabled with FORCE and CREATE POLICY for all tables
- Seed script imports BCRYPT_SALT_ROUNDS from shared
- Seed includes error/failure state data
