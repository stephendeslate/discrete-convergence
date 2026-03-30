# Infrastructure Specification

## Overview
Containerized deployment with Docker, orchestrated with docker-compose.
CI/CD via GitHub Actions.

## Docker
- Base image: node:20-alpine
- Multi-stage build: deps -> build -> production
- USER node (non-root)
- HEALTHCHECK with wget to /health
- LABEL maintainer
- Copies turbo.json for build orchestration

## Docker Compose
- PostgreSQL 16 with healthcheck and named volume
- API service depends on healthy postgres
- Environment variables for all required config
- docker-compose.test.yml for test database (tmpfs)

## CI Pipeline (GitHub Actions)
- Triggers: push to main, PRs to main
- PostgreSQL service container
- Steps: install, audit, lint, typecheck, test, build
- Uses pnpm/action-setup and actions/setup-node with cache
- pnpm turbo run for all tasks

## Environment Variables (7+)
- DATABASE_URL: PostgreSQL connection with connection_limit
- POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- JWT_SECRET: minimum 32 character secret
- BCRYPT_SALT_ROUNDS: 12 (from shared)
- PORT: API port (3001)
- CORS_ORIGIN: allowed frontend origin
- NODE_ENV: development/production/test
- APP_VERSION: current version
- NEXT_PUBLIC_API_URL: frontend API URL

## Database Migrations
- Prisma migrations in prisma/migrations/
- Initial migration includes all tables, indexes, and RLS policies
- RLS: ENABLE + FORCE + CREATE POLICY for all tables

## Seed Data
- prisma/seed.ts with main() + disconnect pattern
- console.error + process.exit(1) on failure
- Imports BCRYPT_SALT_ROUNDS from shared
- Includes error/failure state data (RETIRED vehicles, TERMINATED drivers, CANCELLED trips, EMERGENCY maintenance)

## Monorepo
- Turborepo with pnpm workspaces
- workspace:* protocol for internal dependencies
- turbo.json defines build, lint, test, typecheck tasks

## Cross-References
- See [security.md](security.md) for security configuration
- See [monitoring.md](monitoring.md) for health endpoints
