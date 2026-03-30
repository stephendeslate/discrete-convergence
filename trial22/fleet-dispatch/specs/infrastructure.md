# Infrastructure Specification

## Overview

Fleet Dispatch uses a Turborepo monorepo with pnpm workspaces, Docker multi-stage
builds, GitHub Actions CI, and PostgreSQL 16.

## Monorepo Structure

```
fleet-dispatch/
  apps/api/     — NestJS 11 backend
  apps/web/     — Next.js 15 frontend
  packages/shared/ — Shared utilities
```

<!-- VERIFY: FD-INFRA-001 — Turborepo workspace with apps/* and packages/* -->

## Docker

### Dockerfile
- Multi-stage build: deps -> build -> production
- COPY packages/shared in production stage for runtime access
- HEALTHCHECK with curl to /health
- USER node for security

<!-- VERIFY: FD-INFRA-002 — Dockerfile COPY packages/shared in production stage -->

### Docker Compose
- PostgreSQL 16-alpine with healthcheck
- API service depends on db healthy
- Named volume for data persistence

### Docker Compose Test
- Separate test database on port 5433

## Database Migrations

- Prisma 6 migrations in apps/api/prisma/migrations/
- Initial migration creates all 14 tables with indexes
- RLS policies applied in migration SQL

<!-- VERIFY: FD-INFRA-003 — migration.sql contains CREATE TABLE DDL for all 14 tables -->

## CI/CD (GitHub Actions)

- Lint, typecheck, test, build pipeline
- Migration check verifies prisma schema is in sync
- Security audit with pnpm audit

<!-- VERIFY: FD-INFRA-004 — CI workflow includes lint, typecheck, test, and build -->

## Environment Variables

Required: DATABASE_URL, JWT_SECRET
Optional: CORS_ORIGIN, PORT, API_URL, NODE_ENV

<!-- VERIFY: FD-INFRA-005 — validateEnvVars checks DATABASE_URL and JWT_SECRET at startup -->
