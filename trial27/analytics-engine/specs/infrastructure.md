# Infrastructure Specification

## Overview

The Analytics Engine is containerized with Docker and orchestrated with Docker Compose.
CI/CD runs via GitHub Actions. Health checks and graceful shutdown are built into the API.

## Docker

### VERIFY: AE-INFRA-001 — Dockerfile
The Dockerfile uses a multi-stage build with Node.js 20 Alpine:
1. Install stage: pnpm install with frozen lockfile
2. Build stage: prisma generate + nest build
3. Production stage: minimal image with only dist and node_modules

The production stage copies `packages/shared` for workspace dependency resolution.
Includes HEALTHCHECK and LABEL maintainer directives.

### VERIFY: AE-INFRA-002 — Docker Compose
docker-compose.yml defines:
- `api` service (NestJS backend, port 3001)
- `db` service (PostgreSQL 16)

docker-compose.test.yml defines:
- `test-db` service (PostgreSQL for integration tests)

## Health Checks

### VERIFY: AE-INFRA-003 — Health endpoints
- GET /health — Basic liveness check, returns { status: "ok" }
- GET /health/ready — Readiness check with database connectivity probe

Health endpoints are public (no JWT required).

## Graceful Shutdown

### VERIFY: AE-INFRA-004 — Shutdown hooks
The application calls `app.enableShutdownHooks()` in main.ts.
On SIGTERM, the application gracefully disconnects from the database
and closes all HTTP connections before exiting.

## Environment Variables

### VERIFY: AE-INFRA-005 — Environment validation
Required environment variables are validated at startup:
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Secret key for JWT signing

Missing variables cause immediate startup failure with descriptive error.

## CI/CD

### VERIFY: AE-INFRA-006 — GitHub Actions
The CI pipeline runs: install → lint → typecheck → test → build → Docker build.

## Logging

Structured JSON logging via pino logger.
Correlation IDs are read from `X-Correlation-ID` header and included in log context.

## Cross-References

- Health endpoint contracts: See [api-endpoints.md](api-endpoints.md)
- Security configuration: See [security.md](security.md)
- Monitoring details: See [monitoring.md](monitoring.md)
