# Infrastructure Specification

## Overview

The Event Management Platform uses a Turborepo monorepo with pnpm workspaces.
It includes Docker support for containerized deployment, GitHub Actions CI/CD,
and PostgreSQL as the primary database.

## Monorepo Structure

VERIFY: EM-INFRA-001 — Shared package compiles to dist/ with declaration files

```
event-management/
  apps/api/        — NestJS 11 API server
  apps/web/        — Next.js 15 frontend
  packages/shared/ — Shared TypeScript utilities
```

The shared package MUST produce dist/index.js and dist/index.d.ts.
Its package.json specifies main: "dist/index.js" and types: "dist/index.d.ts".
The tsconfig sets outDir: "dist" and rootDir: "src" with declaration: true.

See: cross-layer.md for shared package integration

## Build Pipeline

VERIFY: EM-INFRA-002 — Turbo build depends on ^build for correct ordering

The turbo.json configuration ensures:
- build depends on ^build (shared builds before apps)
- test depends on ^build (tests run after compilation)
- lint has no dependencies (runs in parallel)

Build order: packages/shared -> apps/api + apps/web (parallel)

## Docker

VERIFY: EM-INFRA-003 — main.ts reads PORT from process.env.PORT

Multi-stage Dockerfile:
1. deps stage: install production dependencies
2. build stage: compile TypeScript, generate Prisma client
3. production stage: minimal image with compiled output

Key details:
- prisma generate runs before tsc compilation
- HEALTHCHECK uses wget to /health
- Runs as non-root user (node)
- CMD starts apps/api/dist/main.js

docker-compose.yml:
- PostgreSQL 16-alpine with healthcheck
- API service depends on healthy postgres
- Environment variables from .env

docker-compose.test.yml:
- Test database with tmpfs for speed
- Separate port to avoid conflicts

## CI/CD Pipeline

GitHub Actions workflow (ci.yml) runs:
1. lint: ESLint with zero warnings
2. typecheck: TypeScript compilation check
3. test: Jest with PostgreSQL service container
4. build: Full turbo build
5. migration-check: Validates Prisma migrations
6. audit: pnpm audit for vulnerabilities

See: security.md for audit configuration
See: monitoring.md for health check integration

## Environment Variables

Required variables (validated at startup):
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Access token signing key
- JWT_REFRESH_SECRET: Refresh token signing key
- PORT: API server port (default 3001)
- CORS_ORIGIN: Allowed CORS origin

See: authentication.md for JWT configuration
See: security.md for env validation
