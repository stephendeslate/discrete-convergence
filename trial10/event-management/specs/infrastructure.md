# Infrastructure Specification

> **Project:** Event Management
> **Category:** INFRA
> **Related:** See [data-model.md](data-model.md) for schema and RLS, see [cross-layer.md](cross-layer.md) for shared package integration

---

## Overview

The event management platform is deployed as a containerized application using Docker with multi-stage builds. CI/CD runs via GitHub Actions with PostgreSQL service containers. The monorepo is managed with Turborepo and pnpm workspaces. All infrastructure follows the 12-factor app methodology — no hardcoded secrets.

---

## Requirements

### VERIFY:EM-INFRA-001 — Multi-stage Dockerfile

The Dockerfile uses a multi-stage build: `deps` stage installs dependencies with `pnpm install --frozen-lockfile` and copies `turbo.json`, `build` stage compiles the application, and `production` stage runs with `node:20-alpine`, `USER node`, `HEALTHCHECK CMD wget -q --spider http://localhost:3001/health || exit 1`, and `LABEL maintainer="event-management"`.

### VERIFY:EM-INFRA-002 — Docker Compose with PostgreSQL

`docker-compose.yml` defines PostgreSQL 16 with a healthcheck (`pg_isready`), named volume for persistence, and proper environment variables. `docker-compose.test.yml` extends the base config for test execution with tmpfs for ephemeral data. The `.env.example` documents all required environment variables.

### VERIFY:EM-INFRA-003 — CI/CD with GitHub Actions

The CI workflow (`.github/workflows/ci.yml`) runs lint, typecheck, build, test, and audit jobs. It uses a PostgreSQL 16 service container with healthcheck. All commands use `pnpm turbo run` for monorepo-aware execution. Includes `pnpm audit --audit-level=high`.

### VERIFY:EM-INFRA-004 — Environment validation at startup

The application validates required environment variables at startup using `validateEnvVars()` imported from the shared package. Missing variables cause immediate process termination with a descriptive error message. No environment variable has a hardcoded fallback — all use `??` or validation, never `|| 'value'`.

### VERIFY:EM-INFRA-005 — Seed with error handling and shared imports

The seed file (`prisma/seed.ts`) imports `BCRYPT_SALT_ROUNDS` from the shared package for password hashing. It includes a `main()` function with `disconnect()` in finally, `console.error` + `process.exit(1)` error handling, and seeds at least one error/failure state record (e.g., a CANCELLED event, SOLD_OUT ticket, CANCELLED registration).

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
LABEL maintainer="event-management"
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
