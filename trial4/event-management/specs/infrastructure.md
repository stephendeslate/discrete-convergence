# Infrastructure Specification

## Overview

The Event Management platform uses a multi-stage Dockerfile, Docker Compose with
PostgreSQL 16, GitHub Actions CI/CD, and environment validation at startup.
The monorepo uses Turborepo with pnpm workspaces.

See [cross-layer.md](cross-layer.md) for shared package integration details.

## Requirements

### VERIFY:EM-INFRA-001 — Startup Environment Validation
The `validateEnvVars()` function from `@event-management/shared` is called in
`main.ts` at startup with required variables: DATABASE_URL, JWT_SECRET, CORS_ORIGIN.
Missing variables cause process.exit(1) with an error message to stderr.

### VERIFY:EM-INFRA-002 — Seed with Error Handling
The seed script (`prisma/seed.ts`) includes:
- `main()` + `$disconnect()` pattern
- `catch` block with `console.error` + `process.exit(1)` error handling
- `BCRYPT_SALT_ROUNDS` imported from shared (not hardcoded)
- Error/failure state seed data (cancelled event, completed event)

### VERIFY:EM-INFRA-003 — Bootstrap Configuration
The `main.ts` bootstrap function configures:
- `validateEnvVars()` call before app creation
- Helmet with CSP (default-src, script-src, style-src, img-src, frame-ancestors)
- CORS from `CORS_ORIGIN` env var (credentials: true, explicit methods/headers)
- ValidationPipe with whitelist + forbidNonWhitelisted + transform

### VERIFY:EM-INFRA-004 — Multi-Stage Dockerfile
The Dockerfile uses three stages:
1. deps: node:20-alpine, pnpm install, COPY turbo.json
2. build: pnpm turbo run build
3. production: USER node, HEALTHCHECK, LABEL maintainer, EXPOSE 3001

## Docker Compose

PostgreSQL 16 with:
- Named volume `pgdata` for persistence
- `pg_isready` healthcheck
- API service depends on healthy postgres

## CI/CD Pipeline

GitHub Actions workflow:
1. PostgreSQL service container
2. pnpm install
3. prisma generate
4. lint → typecheck → test → build → migration check → audit

## ORM Configuration

Prisma pinned with `>=6.0.0 <7.0.0` (no caret) to prevent breaking major version
bumps. The `@prisma/client` dependency matches the same range.

## TypeScript Configuration

No `rootDir` set in tsconfig.json for packages using monorepo path aliases.
This avoids conflicts with `paths` aliases pointing outside the package directory.

## Environment Variables

Required:
- `DATABASE_URL` — PostgreSQL connection with `connection_limit`
- `JWT_SECRET` — JWT signing secret (no fallback)
- `CORS_ORIGIN` — allowed CORS origin (no fallback)

Optional:
- `PORT` — API server port (defaults to 3001 via `??`)
