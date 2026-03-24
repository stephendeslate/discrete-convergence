# Infrastructure Specification

> **Project:** Analytics Engine
> **Category:** INFRA
> **Related:** See [data-model.md](data-model.md) for schema and RLS, see [cross-layer.md](cross-layer.md) for shared package integration

---

## Overview

The analytics engine is deployed as a containerized application using Docker with multi-stage builds. CI/CD runs via GitHub Actions with PostgreSQL service containers. The monorepo is managed with Turborepo and pnpm workspaces. All infrastructure follows the 12-factor app methodology — no hardcoded secrets.

---

## Requirements

### VERIFY:AE-INFRA-001 — Multi-stage Dockerfile

The Dockerfile uses a multi-stage build: `deps` stage installs dependencies with `pnpm install --frozen-lockfile` and copies `turbo.json`, `build` stage compiles the application, and `production` stage runs with `node:20-alpine`, `USER node`, `HEALTHCHECK CMD wget -q --spider http://localhost:3001/health || exit 1`, and `LABEL maintainer="analytics-engine"`.

### VERIFY:AE-INFRA-002 — CI/CD with GitHub Actions

The CI workflow (`.github/workflows/ci.yml`) runs lint, test, build, typecheck, migration-check, and audit jobs. It uses a PostgreSQL 16 service container with healthcheck. All commands use `pnpm turbo run` for monorepo-aware execution. Includes `pnpm audit --audit-level=high`.

### VERIFY:AE-INFRA-003 — Docker Compose with PostgreSQL

`docker-compose.yml` defines PostgreSQL 16 with a healthcheck (`pg_isready`), named volume for persistence, and proper environment variables. `docker-compose.test.yml` extends the base config for test execution. The `.env.example` documents all required environment variables.

### VERIFY:AE-INFRA-004 — Environment validation at startup

The application validates required environment variables at startup using `validateEnvVars()` imported from the shared package. Missing variables cause immediate process termination with a descriptive error message. No environment variable has a hardcoded fallback — all use `??` or validation, never `|| 'value'`.

---

## Dockerfile Stages

```dockerfile
# Stage 1: deps — install dependencies
FROM node:20-alpine AS deps
COPY turbo.json pnpm-workspace.yaml pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Stage 2: build — compile
FROM deps AS build
COPY . .
RUN pnpm turbo run build

# Stage 3: production — runtime
FROM node:20-alpine AS production
USER node
HEALTHCHECK CMD wget -q --spider http://localhost:3001/health || exit 1
LABEL maintainer="analytics-engine"
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string with connection_limit |
| JWT_SECRET | Yes | Secret for JWT signing |
| JWT_REFRESH_SECRET | Yes | Secret for refresh tokens |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| NODE_ENV | Yes | Environment (development/production) |
| PORT | No | Server port (default via validation) |

---

## Monorepo Configuration

The project uses Turborepo with pnpm workspaces:
- `turbo.json`: defines build, lint, test, typecheck pipelines
- `pnpm-workspace.yaml`: declares `apps/*` and `packages/*` workspaces
- Root `package.json`: includes `turbo` in `devDependencies` and `packageManager` field
