# Infrastructure Specification

> **Project:** Fleet Dispatch
> **Category:** INFRA
> **Related:** See [data-model.md](data-model.md) for database schema, see [monitoring.md](monitoring.md) for health endpoints

---

## Overview

The fleet dispatch platform uses a Turborepo monorepo with pnpm workspaces. The API runs on NestJS 11 with Prisma ORM and PostgreSQL 16. Infrastructure includes Docker multi-stage builds, GitHub Actions CI, and environment variable validation at startup.

---

## Requirements

### VERIFY:FD-INFRA-001 — Multi-stage Dockerfile

The Dockerfile uses three stages: deps (install dependencies), build (compile), and production (runtime). Base image is `node:20-alpine`. The production stage runs as `USER node`, includes a `HEALTHCHECK`, and has a `LABEL maintainer`.

### VERIFY:FD-INFRA-002 — Docker Compose with PostgreSQL healthcheck

Docker Compose defines a PostgreSQL 16 service with `pg_isready` healthcheck and a named volume for data persistence. The API service depends on the database with `condition: service_healthy`.

### VERIFY:FD-INFRA-003 — CI pipeline with full gate verification

GitHub Actions CI runs lint, typecheck, build, test, and audit steps. It uses a PostgreSQL service container for integration tests. The pipeline runs on push to main and pull requests.

### VERIFY:FD-INFRA-004 — Environment validation at startup

The `main.ts` bootstrap function calls `validateEnvVars()` from the shared package to verify required environment variables are set. Missing variables cause `process.exit(1)` before the application starts.

---

## Monorepo Structure

```
fleet-dispatch/
  apps/
    api/        — NestJS 11 backend
    web/        — Next.js 15 frontend
  packages/
    shared/     — TypeScript utility library
  turbo.json    — Turborepo task config
  pnpm-workspace.yaml
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | yes |
| JWT_SECRET | JWT signing secret | yes |
| JWT_REFRESH_SECRET | Refresh token secret | yes |
| CORS_ORIGIN | Allowed CORS origins | yes |
| NODE_ENV | Runtime environment | yes |
| PORT | API server port | no |
