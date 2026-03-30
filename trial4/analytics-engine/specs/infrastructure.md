# Infrastructure Specification

## Overview

The Analytics Engine uses a Turborepo monorepo with pnpm workspaces,
multi-stage Docker builds, PostgreSQL 16, and GitHub Actions CI/CD.

See [data-model.md](data-model.md) for database schema details.
See [cross-layer.md](cross-layer.md) for shared package integration.

## Monorepo Structure

```
analytics-engine/
  apps/api/      — NestJS 11 backend
  apps/web/      — Next.js 15 frontend
  packages/shared/ — shared utilities
  specs/         — specification documents
```

## Requirements

### VERIFY:AE-INF-001
Dockerfile MUST use multi-stage build (deps → build → production),
node:20-alpine base, USER node, HEALTHCHECK, and LABEL maintainer.

### VERIFY:AE-INF-002
Seed file MUST import BCRYPT_SALT_ROUNDS from shared. Must include
error handling with console.error + process.exit(1). Must include
error/failure state data (failed sync runs, dead letter events).

### VERIFY:AE-INF-003
CI/CD pipeline MUST include: lint, test, build, typecheck,
migration-check, and audit jobs. Uses PostgreSQL service container
and pnpm turbo run for task execution.

### VERIFY:AE-INF-004
turbo MUST be in root package.json devDependencies. Both apps MUST
use workspace:* protocol for shared package dependency.

### VERIFY:AE-INF-005
Shared package MUST export >= 8 consumed utilities. Every named export
from packages/shared/src/index.ts must have at least one consumer
outside the shared package.

## Dockerfile

Three-stage multi-stage build:
1. **deps** — install dependencies with frozen lockfile
2. **build** — copy source and run turbo build
3. **production** — minimal runtime with node user

Key features:
- node:20-alpine base image
- COPY turbo.json in deps stage
- USER node for non-root execution
- HEALTHCHECK via wget to /health
- LABEL maintainer for image metadata

## Docker Compose

### Development (docker-compose.yml)
- PostgreSQL 16 with healthcheck and named volume
- API service with environment variables
- No secret fallbacks in env vars

### Testing (docker-compose.test.yml)
- PostgreSQL 16 with tmpfs (ephemeral data)
- Separate port (5433) to avoid conflicts

## CI/CD Pipeline

GitHub Actions jobs:
1. **lint** — run linters
2. **typecheck** — tsc --noEmit
3. **test** — run tests with PostgreSQL service
4. **build** — verify build succeeds
5. **migration-check** — prisma migrate deploy
6. **audit** — pnpm audit --audit-level=high

## Shared Package

Exports (>= 8 consumed utilities):
- APP_VERSION — health endpoint + CLAUDE.md
- BCRYPT_SALT_ROUNDS — auth service + seed
- MAX_PAGE_SIZE — pagination clamping
- DEFAULT_PAGE_SIZE — pagination defaults
- ALLOWED_REGISTRATION_ROLES — registration validation
- MAX_WIDGETS_PER_DASHBOARD — widget count cap
- createCorrelationId — correlation middleware
- sanitizeLogContext — exception filter
- formatLogEntry — request logging
- validateEnvVars — startup validation
- clampPagination — pagination utility

## ORM Version Pinning

Prisma packages pinned with range semver:
- prisma: >=6.0.0 <7.0.0
- @prisma/client: >=6.0.0 <7.0.0

No caret (^) or tilde (~) for schema-defining ORM packages.
