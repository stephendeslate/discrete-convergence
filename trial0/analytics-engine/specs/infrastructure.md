# Infrastructure Specification

## Overview

Containerized deployment with multi-stage Docker build, PostgreSQL 16 with
health checks, CI/CD via GitHub Actions, and Prisma migrations with RLS.

## Docker

### API Dockerfile (Multi-Stage)

Stage 1 — deps: Install pnpm, copy workspace config, install dependencies
Stage 2 — build: Copy source, run turbo build for api
Stage 3 — runtime: Copy built output, run as non-root user

Requirements:
- Base image: node:20-alpine
- HEALTHCHECK: curl localhost:3000/api/monitoring/health
- LABEL: maintainer, version, description
- USER node (non-root)
- .dockerignore excludes node_modules, .git, dist, coverage

### docker-compose.yml

Services:
- api: Builds from Dockerfile, depends on postgres, env from .env
- postgres: PostgreSQL 16 with healthcheck, named volume for data persistence

PostgreSQL healthcheck: pg_isready -U postgres
Named volume: postgres_data

### docker-compose.test.yml

Extends base compose for test environment:
- Separate test database
- API runs test command instead of start
- No named volume (ephemeral)

## CI/CD Pipeline

### GitHub Actions Workflow (.github/workflows/ci.yml)

Triggers: push to main, pull requests to main

Jobs:
1. **lint** — pnpm turbo run lint
2. **test** — pnpm turbo run test (with PostgreSQL service container)
3. **build** — pnpm turbo run build
4. **typecheck** — pnpm turbo run typecheck
5. **migration-check** — Verify migrations are up to date
6. **audit** — pnpm audit for security vulnerabilities

PostgreSQL service container:
- image: postgres:16
- health check: pg_isready
- ports: 5432:5432

Steps in each job:
- Checkout
- Setup Node.js 20
- Setup pnpm
- Install dependencies (pnpm install --frozen-lockfile)
- Run task

## Migrations

- VERIFY:AE-MIG-001 — Initial migration creates all tables with RLS
- Migration includes ENABLE ROW LEVEL SECURITY on all tenant-scoped tables
- Migration includes FORCE ROW LEVEL SECURITY to apply to table owners
- RLS policies use current_setting('app.tenant_id') for tenant isolation
- Turbo task: db:migrate runs prisma migrate deploy

## Environment

### .env.example

| Variable | Example | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://postgres:postgres@localhost:5432/analytics | DB connection |
| JWT_SECRET | change-me-in-production | JWT signing key |
| JWT_EXPIRES_IN | 1h | Token expiry |
| CORS_ORIGIN | http://localhost:3001 | Allowed CORS origin |
| PORT | 3000 | API port |

- VERIFY:AE-ENV-001 — validateEnvVars() checks all required vars at startup

## Turbo Configuration

Tasks defined in turbo.json:
- build: depends on ^build
- dev: persistent, no cache
- lint: no dependencies
- test: depends on build
- typecheck: depends on ^build
- db:migrate: no cache
- db:seed: no cache

## Cross-References

- See [data-model.md](data-model.md) for schema and RLS details
- See [monitoring.md](monitoring.md) for health endpoint used by Docker HEALTHCHECK
- See [security.md](security.md) for environment variable security
