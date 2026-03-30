# Infrastructure Specification

> **Project:** Event Management
> **Domain:** INFRA
> **VERIFY Tags:** EM-INFRA-001 – EM-INFRA-004

---

## Overview

Containerized deployment with multi-stage Docker builds. PostgreSQL 16 database
with health checks. GitHub Actions CI pipeline for automated testing and
deployment validation. Environment variables validated at application startup.

---

## Requirements

### EM-INFRA-001: Multi-Stage Dockerfile

<!-- VERIFY: EM-INFRA-001 -->

- Three stages: `deps` (install), `build` (compile), `production` (runtime).
- `prisma generate` runs in the build stage before TypeScript compilation.
- Production stage runs as non-root `node` user.
- HEALTHCHECK directive hits `GET /health` on port 3001.
- Shared package is copied to the production stage.

### EM-INFRA-002: Docker Compose with PostgreSQL 16

<!-- VERIFY: EM-INFRA-002 -->

- PostgreSQL 16 Alpine image with health check using `pg_isready`.
- API service depends on PostgreSQL with `condition: service_healthy`.
- Named volume for persistent database storage.
- Environment variables passed through from `.env` file.

### EM-INFRA-003: CI Pipeline

<!-- VERIFY: EM-INFRA-003 -->

- GitHub Actions workflow triggered on push and pull request to main.
- Steps: lint, typecheck, build, test, audit.
- PostgreSQL service container for integration tests.
- Environment variables configured for CI environment.
- `pnpm` package manager with caching.

### EM-INFRA-004: Environment Validation at Startup

<!-- VERIFY: EM-INFRA-004 -->

- `validateEnvVars()` from `@repo/shared` called in `main.ts`.
- Required variables: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN.
- Application fails fast with a descriptive error if any are missing.
- No hardcoded fallback values for secrets.
