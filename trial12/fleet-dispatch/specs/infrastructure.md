# Infrastructure Specification

## Overview

Fleet Dispatch uses containerized deployment with Docker, PostgreSQL 16
for data storage, and GitHub Actions for CI/CD. The monorepo is managed
by Turborepo with pnpm workspaces.

## Requirements

### Docker Configuration

- VERIFY: FD-INFRA-001
  Multi-stage Dockerfile with builder and runner stages.
  Builder installs dependencies and builds all packages via turbo.
  Runner uses slim Node.js image with HEALTHCHECK, LABEL metadata,
  and runs as non-root user (USER node).

- VERIFY: FD-INFRA-002
  docker-compose.yml defines API service and PostgreSQL 16 service.
  PostgreSQL has health check (pg_isready), named volume for data persistence,
  and connection_limit parameter in DATABASE_URL.

### Environment Configuration

- VERIFY: FD-INFRA-003
  .env.example documents all required environment variables:
  DATABASE_URL, JWT_SECRET, CORS_ORIGIN, NODE_ENV, PORT, THROTTLE_TTL.
  No actual secrets are committed to the repository.

### CI/CD Pipeline

- VERIFY: FD-INFRA-004
  GitHub Actions CI workflow runs on push/PR to main branch.
  Pipeline steps: checkout, pnpm install, lint, typecheck, build, test,
  prisma migration check, and pnpm audit.
  PostgreSQL service container is provisioned for integration tests.

### Monorepo Structure

- Root package.json includes turbo in devDependencies and pnpm.overrides
  for effect>=3.20.0 (Prisma transitive vulnerability fix).
- turbo.json defines build, test, lint, typecheck task pipeline.
- pnpm-workspace.yaml configures apps/* and packages/* workspaces.

### Database Migrations

- Prisma migrations stored in apps/api/prisma/migrations/.
- Initial migration creates all tables, enums, indexes, and RLS policies.
- Migration check in CI ensures schema and migration files stay in sync.

### Test Infrastructure

- docker-compose.test.yml provides isolated test database.
- Jest configuration in each workspace with appropriate transforms.
- API tests use @nestjs/testing TestingModule with provider overrides.

## Cross-References

- See [data-model.md](data-model.md) for database schema details
- See [security.md](security.md) for RLS and environment variable handling
- See [monitoring.md](monitoring.md) for health check endpoints
