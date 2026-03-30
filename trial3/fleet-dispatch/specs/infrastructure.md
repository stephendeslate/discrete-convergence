# Infrastructure Specification

## Overview

Fleet Dispatch uses Docker for containerization, GitHub Actions for CI/CD,
and PostgreSQL 16 for data persistence.

## Docker

### Dockerfile

Multi-stage build with three stages:
1. `deps` — Install dependencies with pnpm
2. `build` — Build the application with turbo
3. `production` — Minimal runtime image

<!-- VERIFY:FD-INF-001 — validateEnvVars checks required env vars at startup -->
<!-- VERIFY:FD-INF-002 — Seed uses BCRYPT_SALT_ROUNDS from shared with error handling -->
<!-- VERIFY:FD-INF-003 — Dockerfile uses node:20-alpine, USER node, HEALTHCHECK, LABEL -->

Key features:
- Base image: `node:20-alpine`
- `USER node` for non-root execution
- `HEALTHCHECK` for container health monitoring
- `LABEL maintainer` for image metadata
- COPYs `turbo.json` in deps stage

### Docker Compose

- PostgreSQL 16 Alpine with healthcheck
- Named volume for data persistence
- API service depends on healthy postgres
- `connection_limit=10` in DATABASE_URL

### Docker Compose Test

- Ephemeral PostgreSQL with tmpfs
- Separate port (5433) to avoid conflicts

## CI/CD

GitHub Actions workflow (`ci.yml`) runs:
1. Lint (`pnpm turbo run lint`)
2. Typecheck (`pnpm turbo run typecheck`)
3. Build (`pnpm turbo run build`)
4. Test (`pnpm turbo run test`)
5. Migration check (`prisma migrate deploy`)
6. Security audit (`pnpm audit --audit-level=high`)

Uses PostgreSQL 16 service container for integration tests.

## Prisma

- Schema at `apps/api/prisma/schema.prisma`
- Migrations in `apps/api/prisma/migrations/`
- Seed script at `apps/api/prisma/seed.ts`
- Prisma version pinned with `>=6.0.0 <7.0.0` (no caret)

## Seed Data

Seed includes:
- Company (Acme Field Services)
- Users (admin, dispatcher, technician, customer)
- Technician with skills
- Customer with address
- Work orders (completed, unassigned, cancelled)
- Invoice with line items
- Audit log entry
- Notifications

Error/failure state data included for testing edge cases.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | JWT signing secret |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| PORT | No | API server port (default 3001) |
| API_URL | No | Backend API URL for frontend |
