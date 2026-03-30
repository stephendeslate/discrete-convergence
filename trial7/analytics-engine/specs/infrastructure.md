# Infrastructure Specification

## Overview

The Analytics Engine uses a containerized deployment with Docker, CI/CD via
GitHub Actions, and PostgreSQL as the primary database.
See [data-model.md](data-model.md) for schema details.

## Docker

### Dockerfile
Multi-stage build: deps -> build -> production
- Base image: node:20-alpine
- LABEL maintainer set
- USER node for non-root execution
- HEALTHCHECK configured for /health endpoint
- COPYs turbo.json in deps stage for workspace awareness

### docker-compose.yml
- PostgreSQL 16 with healthcheck and named volume (pgdata)
- API service depends on healthy DB
- DATABASE_URL includes connection_limit=10

### docker-compose.test.yml
- Separate PostgreSQL instance for test environment
- Port 5433 to avoid conflicts with development DB

### .dockerignore
Excludes node_modules, .git, dist, .next, .env files, and logs.

## CI/CD

### GitHub Actions Workflow (.github/workflows/ci.yml)
Jobs:
1. **lint** — pnpm turbo run lint
2. **typecheck** — pnpm turbo run typecheck
3. **test** — pnpm turbo run test (with PostgreSQL service container)
4. **build** — pnpm turbo run build (depends on lint, typecheck, test)
5. **migration-check** — verifies migrations directory exists
6. **audit** — pnpm audit --audit-level=high

All jobs use:
- Node.js 20
- pnpm with caching
- Frozen lockfile installation

- VERIFY: AE-INFRA-001 — Main bootstrap validates env vars and configures Helmet, CORS, ValidationPipe
- VERIFY: AE-INFRA-002 — Seed script creates tenant, users, dashboards, data sources with error handling

## Seed Data

The seed script (prisma/seed.ts):
- Creates a default tenant (Acme Analytics)
- Creates admin and viewer users with BCRYPT_SALT_ROUNDS from shared
- Creates sample dashboards (including error/failure state)
- Creates data sources (including error state)
- Creates sample widget and audit log
- Error handling: main().catch() with console.error + process.exit(1)
- Cleanup: prisma.$disconnect() in finally block

## Environment Variables

Validated at startup via validateEnvVars() from shared.
Required: DATABASE_URL, JWT_SECRET, CORS_ORIGIN.
No hardcoded fallbacks for secrets.

## Monorepo

- Turborepo 2 in root devDependencies
- pnpm workspaces: apps/*, packages/*
- Shared package: workspace:* protocol
- ORM (Prisma) pinned with >=6.0.0 <7.0.0 range
