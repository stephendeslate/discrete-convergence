# Infrastructure Specification

## Overview
Multi-stage Docker builds, docker-compose for local development,
GitHub Actions CI/CD with PostgreSQL service container.

## Docker
- Multi-stage Dockerfile: deps → build → runtime
- Base image: node:20-alpine
- HEALTHCHECK with curl to /monitoring/health
- Non-root user (node) for runtime
- .dockerignore excludes node_modules, .git, dist, coverage, .env, .turbo

## Docker Compose
- api service: builds from Dockerfile, exposes port 4000
- postgres service: postgres:16, healthcheck with pg_isready
- Named volume for persistent data
- Test variant (docker-compose.test.yml) with ephemeral database

## CI/CD Pipeline
- GitHub Actions workflow with 6 jobs:
  1. lint — ESLint across workspace
  2. typecheck — tsc --noEmit
  3. test — vitest with PostgreSQL service container
  4. build — turbo build
  5. migration-check — prisma migrate diff
  6. audit — pnpm audit

## Environment
- VERIFY:EM-ENV-001 — validateEnvVars checks DATABASE_URL, JWT_SECRET at startup
- VERIFY:EM-MIG-001 — Migration includes RLS policies
- .env.example documents all required variables
- Cross-reference: [data-model.md](./data-model.md) — Database connection string
- Cross-reference: [monitoring.md](./monitoring.md) — Health check endpoint

## Build System
- Turborepo 2 with pnpm workspaces
- Task pipeline: build depends on ^build, test depends on build
- Shared package built before apps
- Cross-reference: [api-endpoints.md](./api-endpoints.md) — API module structure follows NestJS conventions
- Cross-reference: [frontend.md](./frontend.md) — Next.js 15 build output optimized for production

## Docker Build Stages
- **deps** stage: installs production dependencies with pnpm fetch for cache efficiency
- **build** stage: copies source, runs turbo build, generates Prisma client
- **runtime** stage: copies only built artifacts and node_modules, runs as non-root `node` user
- Final image size minimized by Alpine base and multi-stage pruning
- VERIFY:EM-INFRA-001 — Dockerfile uses non-root user for runtime stage

## CI PostgreSQL Service
- GitHub Actions PostgreSQL 16 service container with health check (pg_isready)
- DATABASE_URL injected as environment variable pointing to service container
- Prisma migrations applied before test execution in CI
- Test database is ephemeral — destroyed after each CI run

## Environment Validation
- VERIFY:EM-ENV-001 — validateEnvVars from shared package checks required variables at startup
- Missing DATABASE_URL or JWT_SECRET causes immediate process exit with descriptive error
- Optional variables (JWT_EXPIRES_IN, CORS_ORIGIN, PORT) fall back to sensible defaults via ?? operator
- .env.example serves as documentation for all supported environment variables
- Cross-reference: [security.md](./security.md) — Environment variables never logged (sanitizer strips secrets)
