# Infrastructure Specification

## Overview

Fleet Dispatch uses a multi-stage Docker build, docker-compose for local development,
and GitHub Actions CI/CD pipeline. The monorepo is managed with pnpm workspaces and
Turborepo for build orchestration.

Cross-references: [monitoring.md](monitoring.md), [security.md](security.md)

## Monorepo Structure

```
fleet-dispatch/
  apps/api/        — NestJS 11 backend
  apps/web/        — Next.js 15 frontend
  packages/shared/ — shared constants, utilities, types
  specs/           — specification documents
```

Package manager: pnpm with workspace protocol.
Build tool: Turborepo with build, test, lint, typecheck pipelines.
pnpm.overrides: effect>=3.20.0 (Prisma transitive dependency fix).

## Docker

### Dockerfile (multi-stage)
1. deps stage: pnpm install --frozen-lockfile
2. build stage: prisma generate BEFORE tsc compilation, nest build
3. production stage: node:20-alpine, USER node, flat dist at apps/api/dist/main.js
4. HEALTHCHECK: curl --fail http://localhost:3001/health
5. EXPOSE 3001

### docker-compose.yml
- postgres:16-alpine with healthcheck (pg_isready)
- api service with DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET env vars
- depends_on postgres with condition: service_healthy

### docker-compose.test.yml
- postgres service for integration testing
- api-test service runs pnpm test:e2e

## CI/CD Pipeline (.github/workflows/ci.yml)

Jobs: lint, typecheck, test, build, migration-check, audit
- pnpm install with cache
- prisma generate before build
- Test with coverage reporting
- npm audit for vulnerability scanning

## Configuration

### Environment Variables (.env.example)
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: access token signing key
- JWT_REFRESH_SECRET: refresh token signing key
- PORT: API server port (default 3001)
- CORS_ORIGIN: allowed CORS origin
- NODE_ENV: runtime environment
- API_URL: backend URL for frontend

### Bootstrap (main.ts)
- validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'])
- disable x-powered-by before any middleware
- helmet with CSP (frameAncestors: none)
- CORS with configurable origin
- ValidationPipe with whitelist + forbidNonWhitelisted
- enableShutdownHooks()
- process.env.PORT for port configuration

Cross-references: [security.md](security.md), [monitoring.md](monitoring.md)

## VERIFY Tags

- VERIFY: FD-INFRA-001 — Prisma service connects and disconnects cleanly
- VERIFY: FD-INFRA-002 — Main bootstrap validates required env vars

## TypeScript Configuration

- Shared: outDir: "dist" (builds to packages/shared/dist/)
- API: rootDir: "src", outDir: "dist", strict: true
- Web: noEmit: true (Next.js handles compilation)
- All packages use strict TypeScript with skipLibCheck
