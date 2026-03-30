# Infrastructure Specification

## Overview

The event-management system runs as a containerized monorepo using
Turborepo for build orchestration, pnpm for package management, and
Docker for deployment. CI/CD is managed through GitHub Actions.

## Monorepo Structure

```
event-management/
  apps/
    api/          # NestJS 11 backend
    web/          # Next.js 15 frontend
  packages/
    shared/       # Shared constants, utilities, types
  specs/          # Specification documents
  turbo.json      # Turborepo task definitions
  pnpm-workspace.yaml
```

## Docker

### Dockerfile
- Multi-stage build: node:20-alpine base
- Runs as non-root USER node for security
- HEALTHCHECK configured for container orchestration
- LABEL maintainer metadata included
- COPYs turbo.json for workspace-aware builds

### docker-compose.yml
- PostgreSQL 16-alpine service with healthcheck
- Named volume for data persistence
- API service depends on healthy database
- Environment variables from .env file

### docker-compose.test.yml
- Test-specific compose for CI environments
- Isolated database for test execution

## CI/CD Pipeline

### GitHub Actions Workflow
- Jobs: lint, typecheck, test, build, migration check, audit
- Uses pnpm/action-setup for consistent package management
- Runs pnpm audit --prod to check for vulnerabilities
- Migration check ensures Prisma schema and migrations are in sync

## Environment Configuration

- VERIFY: EM-INFRA-001 — Seed script populates development database with
  sample data across all 6 models using shared BCRYPT_SALT_ROUNDS.
- .env.example documents all required environment variables:
  DATABASE_URL, JWT_SECRET, API_PORT, CORS_ORIGIN, NODE_ENV, API_URL

## Build Pipeline

- Turborepo orchestrates build/test/lint/typecheck across workspaces.
- Shared package builds first (dependency of api and web).
- Build outputs are cached by Turborepo for incremental builds.
- TypeScript project references ensure correct build ordering.

## Package Management

- pnpm workspaces for monorepo dependency management.
- pnpm.overrides for effect>=3.20.0 to fix Prisma transitive vulnerability.
- packageManager field in root package.json for version pinning.

## Health Monitoring

- Docker HEALTHCHECK polls the API health endpoint.
- Kubernetes-ready with separate health and readiness endpoints.
- Graceful shutdown via Prisma onModuleDestroy lifecycle hook.
