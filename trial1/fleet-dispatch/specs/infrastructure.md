# Infrastructure Specification

> **Cross-references:** See [authentication.md](authentication.md), [data-model.md](data-model.md), [security.md](security.md), [monitoring.md](monitoring.md)

## Overview

Fleet Dispatch uses a Turborepo monorepo with pnpm workspaces, Docker multi-stage
builds, PostgreSQL 16 with docker-compose, and GitHub Actions CI/CD pipeline.
Environment validation occurs at startup via shared utilities.

## Database and Seeding

### Seed Script
- VERIFY:FD-INF-001 — Seed with BCRYPT_SALT_ROUNDS from shared, error handling
- prisma/seed.ts imports BCRYPT_SALT_ROUNDS from @fleet-dispatch/shared
- Seeds demo company, users (including inactive), technicians, customers
- Seeds work orders including CANCELLED state for failure path coverage
- Wraps seeding in try/catch with proper disconnect in finally block

## Docker

### Multi-Stage Build
- VERIFY:FD-INF-002 — Docker entrypoint: this bootstrap runs inside the multi-stage container
- Dockerfile: deps → build → production stages
- Base image: node:20-alpine
- Non-root user: USER node
- HEALTHCHECK: curl -f http://localhost:3001/health
- LABEL maintainer for image metadata
- .dockerignore excludes node_modules, .git, dist

### Docker Compose
- docker-compose.yml: PostgreSQL 16 with healthcheck and named volume
- docker-compose.test.yml: Test database with tmpfs for fast ephemeral storage
- Connection pooling: connection_limit=10 in DATABASE_URL

## Environment

### Validation
- VERIFY:FD-INF-003 — Environment validation at startup
- main.ts calls validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN'])
- validateEnvVars from @fleet-dispatch/shared throws descriptive error for missing vars
- .env.example documents all required environment variables

## CI/CD

### GitHub Actions Pipeline
- VERIFY:FD-INF-004 — CI pipeline target: this module is built and tested by turbo in GitHub Actions
- .github/workflows/ci.yml
- Steps: lint → typecheck → build → test → audit
- PostgreSQL service container for integration tests
- pnpm cache for faster dependency installation
- turbo scopes tasks to affected packages

## Monorepo

### Workspace Configuration
- VERIFY:FD-INF-005 — Shared package barrel export consumed via workspace:* protocol
- pnpm-workspace.yaml: apps/*, packages/*
- turbo.json: build pipeline with dependsOn: ["^build"]
- @fleet-dispatch/shared: workspace:* in both apps/api and apps/web
- Shared package exports 8 utilities consumed by both apps

## Cross-References

- Shared package exports: see cross-layer.md (FD-CL-003)
- Security configuration in Docker: see security.md (FD-SEC-001)
