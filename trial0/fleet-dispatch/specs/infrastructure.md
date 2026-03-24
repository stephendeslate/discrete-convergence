# Infrastructure Specification

## Overview

FleetDispatch uses Docker for containerization, GitHub Actions for CI/CD,
and PostgreSQL 16 for data persistence.

## Docker

### API Dockerfile (Multi-stage)
- Stage 1 (deps): Install pnpm dependencies
- Stage 2 (build): Generate Prisma client, compile TypeScript
- Stage 3 (runtime): node:20-alpine, copy built artifacts, HEALTHCHECK, USER node
- .dockerignore excludes node_modules, .git, .env, dist

### Docker Compose
- Services: api, web, postgres
- PostgreSQL 16 with named volume for persistence
- Health checks on all services
- Environment variables from .env file

### Docker Compose Test
- Separate compose file for integration tests
- Ephemeral PostgreSQL (no volume persistence)
- Runs migrations and seeds before tests

## CI/CD (GitHub Actions)

6-job pipeline:
1. **lint** — ESLint across all packages
2. **typecheck** — TypeScript compilation check
3. **test** — Vitest/Jest with PostgreSQL service container
4. **build** — Turborepo build all packages
5. **migration-check** — Verify migrations are up to date
6. **audit** — npm audit for vulnerabilities

## Environment

- VERIFY:FD-ENV-001 — validateEnvVars checks DATABASE_URL, JWT_SECRET, PORT at startup
- .env.example documents all required variables
- No secrets in source code or docker-compose

## Migrations

- VERIFY:FD-MIG-001 — Initial migration includes schema + RLS policies
- RLS policies use current_setting('app.company_id') for tenant filtering
- ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY on tenant tables

## Package Manager

- pnpm 9.15.4 with corepack
- pnpm-workspace.yaml defines apps/* and packages/* workspace globs
- Turborepo 2 orchestrates build, test, lint, typecheck tasks
- turbo.json configures task pipeline with proper dependency ordering

## Cross-References

- See [Data Model](./data-model.md) for schema and migration details
- See [Security](./security.md) for production security configuration
- See [Monitoring](./monitoring.md) for health check endpoints
- See [Authentication](./authentication.md) for JWT_SECRET environment variable
