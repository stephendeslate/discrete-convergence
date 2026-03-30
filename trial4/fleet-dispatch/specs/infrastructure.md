# Infrastructure Specification

## Overview

Fleet Dispatch uses Docker for containerization, GitHub Actions for CI/CD, Prisma for
database migrations, and pnpm with Turborepo for monorepo management. The infrastructure
supports PostgreSQL 16 with Row Level Security.

## Requirements

### VERIFY:FD-INF-001 — Bootstrap with validateEnvVars at startup

The main.ts bootstrap function must call validateEnvVars() from shared package before
creating the NestJS application. Required variables: DATABASE_URL, JWT_SECRET, CORS_ORIGIN.
Missing variables cause startup failure with descriptive error message.

### VERIFY:FD-INF-002 — Seed with error handling and failure state data

The prisma/seed.ts must: import BCRYPT_SALT_ROUNDS from shared, include a main() function
with proper disconnect in both success and error paths, call console.error + process.exit(1)
on failure, and include error/failure state data (e.g., cancelled work orders).

### VERIFY:FD-INF-003 — Multi-stage Dockerfile with health check

The Dockerfile must use: node:20-alpine base, multi-stage build (deps, build, production),
LABEL maintainer, USER node, HEALTHCHECK command, and COPY turbo.json in deps stage.

### VERIFY:FD-INF-004 — CI/CD with lint, test, build, typecheck, audit

The GitHub Actions workflow must include jobs for: lint, typecheck, test, build,
migration check, and security audit (pnpm audit --audit-level=high). CI must use
PostgreSQL service container and pnpm turbo run for commands.

## Performance Requirements

### VERIFY:FD-PRF-001 — ResponseTimeInterceptor adds X-Response-Time header

The ResponseTimeInterceptor must use performance.now() from perf_hooks to measure
request duration. It must set the X-Response-Time header on all responses in the
format "{duration}ms". Registered as APP_INTERCEPTOR in AppModule.

### VERIFY:FD-PRF-002 — Performance integration tests

Performance tests must use supertest to verify: X-Response-Time header presence and
format, health check response time under 500ms, metrics endpoint with response time tracking.

### VERIFY:FD-PRF-003 — Cache-Control on list endpoints

All list endpoints (findAll operations) must include Cache-Control: private, max-age=30
response header. This applies to work orders, technicians, customers, routes, and invoices.

### VERIFY:FD-PRF-004 — Cache-Control on technician list endpoint

The TechnicianController findAll endpoint must set Cache-Control: private, max-age=30
header. This is in addition to the general list endpoint requirement.

## Docker Configuration

- docker-compose.yml: PostgreSQL 16 with healthcheck, named volume, connection_limit in URL
- docker-compose.test.yml: Separate test database instance
- .dockerignore: Excludes node_modules, .next, dist, .git, .env

## Related Specifications

- See [data-model.md](data-model.md) for schema and migrations
- See [monitoring.md](monitoring.md) for health check endpoints
- See [cross-layer.md](cross-layer.md) for build verification
