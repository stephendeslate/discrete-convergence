# Infrastructure Specification

## Overview

Fleet Dispatch uses a Turborepo monorepo with pnpm workspaces,
Docker multi-stage builds, PostgreSQL 16, and GitHub Actions CI/CD.

## Monorepo Structure

```
fleet-dispatch/
  apps/api/          — NestJS 11 backend
  apps/web/          — Next.js 15 frontend
  packages/shared/   — Shared utilities and constants
  specs/             — Specification documents
```

### VERIFY:FD-INFRA-001 — Seed Script
prisma/seed.ts must:
1. Import BCRYPT_SALT_ROUNDS from @fleet-dispatch/shared
2. Create demo data including error/failure states (cancelled work orders, void invoices)
3. Implement main().catch() with console.error and process.exit(1)
4. Call prisma.$disconnect() in finally block

## Docker

### Dockerfile Requirements
- Base image: node:20-alpine
- Multi-stage: deps → build → production
- LABEL maintainer specified
- COPY turbo.json in deps stage
- USER node in production stage
- HEALTHCHECK configured for /health endpoint
- EXPOSE 3001

### Docker Compose
- PostgreSQL 16 with healthcheck and named volume
- DATABASE_URL with connection_limit parameter
- Service dependency with condition: service_healthy

## CI/CD Pipeline

GitHub Actions workflow with jobs:
1. lint — pnpm turbo run lint
2. typecheck — pnpm turbo run typecheck
3. test — pnpm turbo run test (with PostgreSQL service container)
4. build — pnpm turbo run build
5. migration-check — prisma migrate deploy
6. audit — pnpm audit --audit-level=high

All jobs use pnpm/action-setup@v4 and actions/setup-node@v4 with cache.

## Shared Package

### VERIFY:FD-ARCH-001 — AppModule Provider Chain
AppModule must register via NestJS DI:
- APP_GUARD: ThrottlerGuard (with named configs: default and auth)
- APP_GUARD: JwtAuthGuard
- APP_FILTER: GlobalExceptionFilter
- APP_INTERCEPTOR: ResponseTimeInterceptor
Domain controllers must NOT use @UseGuards(JwtAuthGuard).

Shared package exports (all consumed by at least one app):
- BCRYPT_SALT_ROUNDS — used by auth service and seed
- ALLOWED_REGISTRATION_ROLES — used by register DTO
- APP_VERSION — used by health endpoint and nav component
- clampPagination — used by all services with findAll
- createCorrelationId — used by CorrelationIdMiddleware
- formatLogEntry — used by RequestLoggingMiddleware
- sanitizeLogContext — used by GlobalExceptionFilter
- validateEnvVars — used by main.ts and server actions

## Performance

### VERIFY:FD-PERF-001 — Response Time Interceptor
ResponseTimeInterceptor must be registered as APP_INTERCEPTOR.
Must use performance.now() from perf_hooks for high-resolution timing.
Must set X-Response-Time header on all responses in format "N.NNms".

### VERIFY:FD-PERF-002 — Performance Integration Tests
Performance tests must verify:
- X-Response-Time header present on all responses
- X-Response-Time format matches "N.NNms" pattern
- Health endpoint responds within reasonable time

## Cross-Layer Integration

### VERIFY:FD-CROSS-001 — Cross-Layer Integration Test
Cross-layer test must verify full pipeline:
- X-Response-Time header on health endpoint
- X-Correlation-ID header on all responses
- Client correlation ID preservation
- APP_VERSION in health response
- correlationId in error responses
- Protected endpoints return 401 without auth
- Sanitized error responses without stack traces
- Public health and metrics endpoints accessible without auth

### VERIFY:FD-UI-005 — Dark Mode CSS
Dark mode must use @media (prefers-color-scheme: dark) in globals.css.
Must NOT use .dark class-based approach.
