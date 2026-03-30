# Infrastructure Specification

## Overview

The Analytics Engine uses a Turborepo monorepo with pnpm workspaces. The infrastructure
includes Docker containerization, CI/CD via GitHub Actions, Prisma migrations, and a
shared package for cross-cutting utilities.

## Monorepo Structure

```
analytics-engine/
  apps/
    api/          # NestJS 11 backend
    web/          # Next.js 15 frontend
  packages/
    shared/       # Shared constants, utilities
  specs/          # Specification documents
```

## Requirements

<!-- VERIFY:AE-INFRA-001 — Seed with error handling, BCRYPT_SALT_ROUNDS from shared, error state data -->
- REQ-INFRA-001: Database seed must:
  - Import BCRYPT_SALT_ROUNDS from shared package
  - Include main() + disconnect pattern
  - Use console.error + process.exit(1) for error handling
  - Include error state data (failed sync runs, dead letter events)

<!-- VERIFY:AE-INFRA-002 — Multi-stage Dockerfile with node:20-alpine, USER node, HEALTHCHECK, LABEL -->
- REQ-INFRA-002: Dockerfile must:
  - Use multi-stage build (deps, build, production)
  - Base on node:20-alpine
  - Set USER node
  - Include HEALTHCHECK
  - Include LABEL maintainer
  - COPY turbo.json in deps stage

<!-- VERIFY:AE-ARCH-001 — AppModule with APP_GUARD, APP_FILTER, APP_INTERCEPTOR via NestJS DI -->
- REQ-ARCH-001: AppModule must register all global providers via DI:
  - APP_GUARD: ThrottlerGuard + JwtAuthGuard
  - APP_FILTER: GlobalExceptionFilter
  - APP_INTERCEPTOR: ResponseTimeInterceptor

## Docker Compose

- PostgreSQL 16 with healthcheck and named volume
- API service depends on DB health
- DATABASE_URL with connection_limit=10
- Separate test compose file with tmpfs

## CI/CD Pipeline

GitHub Actions workflow with the following jobs:
1. lint — pnpm turbo run lint
2. test — with PostgreSQL service container
3. build — pnpm turbo run build
4. typecheck — pnpm turbo run typecheck
5. migration-check — prisma migrate deploy
6. audit — pnpm audit --audit-level=high

## Shared Package

The shared package exports the following consumed utilities:

| Export | Consumer | Purpose |
|--------|----------|---------|
| BCRYPT_SALT_ROUNDS | api (auth service, seed) | Password hashing rounds |
| ALLOWED_REGISTRATION_ROLES | api (register DTO) | Role validation |
| APP_VERSION | api (monitoring), web (actions) | Version string |
| createCorrelationId | api (middleware) | Request correlation |
| formatLogEntry | api (middleware) | Structured logging |
| sanitizeLogContext | api (exception filter) | Log redaction |
| validateEnvVars | api (main.ts), web (actions) | Env validation |
| clampPagination | api (pagination utils) | Page size clamping |

All exports are consumed by at least one file outside the shared package.
Zero dead exports.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection with connection_limit |
| JWT_SECRET | Yes | JWT signing secret |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| NODE_ENV | No | Environment mode |
| LOG_LEVEL | No | Pino log level |
| PORT | No | API server port (default 3001) |
| API_URL | No | API URL for frontend |

## ORM Configuration

- Prisma pinned with `>=6.0.0 <7.0.0` (not caret)
- No rootDir in tsconfig.json
- Migration includes RLS statements
