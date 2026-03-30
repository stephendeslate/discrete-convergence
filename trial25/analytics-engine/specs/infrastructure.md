# Infrastructure Specification

## Overview

The Analytics Engine uses Docker for containerization, GitHub Actions for CI/CD,
and a pnpm/Turborepo monorepo for build orchestration.

## Monorepo Structure

```
analytics-engine/
  apps/
    api/         — NestJS 11 backend
    web/         — Next.js 15 frontend
  packages/
    shared/      — Common utilities and types
  pnpm-workspace.yaml
  turbo.json
  package.json
```

<!-- VERIFY:INFRA-MONOREPO — pnpm workspace with turbo.json -->

## Docker

### Dockerfile (Multi-stage)

1. **deps** stage: Install dependencies with pnpm
2. **builder** stage: Build the API with prisma generate && nest build
3. **runner** stage: Production image with minimal footprint

Key requirements:
- HEALTHCHECK instruction present
- LABEL maintainer metadata
- prisma generate runs before nest build
- COPY packages/shared for workspace dependency
- Non-root user for security

<!-- VERIFY:INFRA-DOCKER-HEALTHCHECK — Dockerfile has HEALTHCHECK instruction -->
<!-- VERIFY:INFRA-DOCKER-LABEL — Dockerfile has LABEL metadata -->
<!-- VERIFY:INFRA-DOCKER-PRISMA — prisma generate before build -->

### docker-compose.yml

Services:
- **api**: The NestJS application
  - Depends on postgres
  - Environment variables from .env
  - Port mapping 3001:3001
- **postgres**: PostgreSQL 16
  - Persistent volume
  - Health check with pg_isready

### docker-compose.test.yml

Override for test environment:
- Separate test database
- Test-specific environment variables

## CI/CD (GitHub Actions)

### ci.yml Workflow

Triggers: push to main, pull requests

Steps:
1. Checkout code
2. Setup pnpm
3. Setup Node.js with pnpm cache
4. Install dependencies
5. Run lint (turbo lint)
6. Run typecheck (turbo typecheck)
7. Run tests (turbo test)
8. Build (turbo build)

<!-- VERIFY:INFRA-CI-WORKFLOW — GitHub Actions CI workflow exists -->

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | API server port |
| DATABASE_URL | - | PostgreSQL connection string |
| JWT_SECRET | - | JWT signing secret |
| JWT_ACCESS_EXPIRY | 15m | Access token lifetime |
| JWT_REFRESH_EXPIRY | 7d | Refresh token lifetime |
| NODE_ENV | development | Runtime environment |
| CORS_ORIGIN | * | Allowed CORS origins |

<!-- VERIFY:INFRA-ENV-VARS — .env.example documents all environment variables -->

## Build Pipeline

Turborepo manages task dependencies:
- build: Depends on ^build (workspace deps build first)
- lint: Independent
- typecheck: Independent
- test: Independent

## Package Management

- pnpm with workspace protocol (workspace:*)
- pnpm.overrides for security:
  - effect >= 3.20.0
  - picomatch >= 4.0.4

<!-- VERIFY:INFRA-PNPM-OVERRIDES — pnpm.overrides for effect and picomatch -->

## Deployment Notes

- API listens on process.env.PORT ?? '3001'
- enableShutdownHooks() for graceful termination
- Health check at /health for container orchestration
- Readiness check at /health/ready includes DB connectivity
