# Infrastructure Specification

## Overview

The Analytics Engine uses a monorepo structure with Turborepo, pnpm workspaces,
Docker containerization, and GitHub Actions CI/CD. The shared package provides
constants and utilities consumed by both apps.

## Monorepo Structure

```
analytics-engine/
  apps/api/       — NestJS backend
  apps/web/       — Next.js frontend
  packages/shared/ — Shared types and utilities
```

Managed by pnpm workspaces with `workspace:*` protocol for internal deps.
Turborepo orchestrates build, typecheck, lint, and test tasks.

## Docker

The Dockerfile uses multi-stage builds: deps, build, production.
Base image: node:20-alpine. Production stage runs as `USER node`
with a HEALTHCHECK and LABEL maintainer.

- VERIFY:AE-INFRA-001 — Multi-stage Dockerfile with node:20-alpine,
  USER node, HEALTHCHECK, and LABEL maintainer

## Seed Data

The seed script creates realistic test data including error/failure states.
It imports BCRYPT_SALT_ROUNDS from shared for password hashing consistency.
Error handling uses console.error + process.exit(1).

- VERIFY:AE-SEED-001 — Seed script with error handling and BCRYPT_SALT_ROUNDS
  from shared package

## Shared Package

The shared package exports >= 8 consumed utilities:
APP_VERSION, BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES,
createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars,
clampPagination, and domain constants.
See [data-model.md](data-model.md) for domain constant usage.

- VERIFY:AE-SHARED-001 — Shared package barrel export with >= 8
  consumed named exports

## CI/CD Pipeline

GitHub Actions workflow with jobs:
- lint: Run linting
- typecheck: Run TypeScript type checking
- test: Run tests with PostgreSQL service container
- build: Build all packages
- migration-check: Verify Prisma migrations
- audit: Run pnpm audit --audit-level=high

## Database

PostgreSQL 16 with docker-compose healthcheck and named volume.
Connection uses connection_limit parameter for pool management.

## Environment Variables

Required at startup (validated by validateEnvVars):
- DATABASE_URL
- JWT_SECRET
- CORS_ORIGIN

Optional:
- PORT (defaults to 3001)
- NODE_ENV
- LOG_LEVEL

## ORM Pinning

Prisma is pinned with `>=6.0.0 <7.0.0` ranges to prevent
breaking major version upgrades from caret semver resolution.
