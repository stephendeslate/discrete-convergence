# Infrastructure Specification

> **Project:** Analytics Engine
> **Category:** INFRA
> **Related:** See [data-model.md](data-model.md) for migrations, see [monitoring.md](monitoring.md) for health checks

---

## Overview

The analytics engine runs as a containerized NestJS application with PostgreSQL 16. Infrastructure includes Docker multi-stage builds, Docker Compose for local development, and GitHub Actions CI pipeline.

---

## Requirements

### VERIFY:AE-INFRA-001 — Docker multi-stage build

The Dockerfile uses a multi-stage build pattern: `deps` (install dependencies), `build` (compile TypeScript), `production` (minimal runtime). The base image is `node:20-alpine`. The production stage runs as non-root `USER node` and includes a `HEALTHCHECK` instruction and `LABEL maintainer`. The Dockerfile copies `turbo.json` for monorepo build orchestration.

### VERIFY:AE-INFRA-002 — Docker Compose with PostgreSQL 16

`docker-compose.yml` defines a PostgreSQL 16 service with `pg_isready` healthcheck and a named volume `pgdata` for data persistence. `docker-compose.test.yml` provides a test PostgreSQL instance using `tmpfs` for fast, disposable test databases.

### VERIFY:AE-INFRA-003 — GitHub Actions CI pipeline

The CI workflow (`.github/workflows/ci.yml`) runs lint, typecheck, build, test, and `npm audit` steps. It provisions a PostgreSQL service container with health checks. The workflow triggers on push to main and pull requests.

### VERIFY:AE-INFRA-004 — Environment validation at startup

The application validates required environment variables at startup using `validateEnvVars()` from the shared package. Required variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`. Missing variables cause a startup failure with `process.exit(1)`. All 7 variables are documented in `.env.example`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | JWT signing secret |
| JWT_REFRESH_SECRET | Yes | Refresh token secret |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| NODE_ENV | No | Runtime environment |
| PORT | No | Server port (default: 3001) |
| API_URL | No | API URL for frontend |
