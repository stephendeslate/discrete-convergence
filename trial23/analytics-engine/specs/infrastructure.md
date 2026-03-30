# Infrastructure Specification

> **Project:** Analytics Engine
> **Category:** INFRA
> **Related:** See [data-model.md](data-model.md) for schema and RLS migrations, see [cross-layer.md](cross-layer.md) for shared package integration

---

## Overview

The analytics engine is deployed as a containerized application using Docker with multi-stage builds. CI/CD runs via GitHub Actions with PostgreSQL service containers. The monorepo is managed with Turborepo and pnpm workspaces. All infrastructure follows the 12-factor app methodology — no hardcoded secrets, environment-driven configuration, and stateless processes.

---

## Requirements

### VERIFY: AE-INFRA-001 — Dockerfile multi-stage with prisma generate before tsc

The Dockerfile uses a multi-stage build with three stages. The `deps` stage uses `node:20-alpine`, copies workspace config files (`turbo.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `package.json`), and runs `pnpm install --frozen-lockfile`. The `build` stage copies the full source, runs `pnpm prisma generate` to create the Prisma client BEFORE running `tsc` or `turbo build`. This ordering is critical because TypeScript compilation depends on the generated Prisma types. The `production` stage uses `node:20-alpine` with `USER node`, includes `HEALTHCHECK CMD wget -q --spider http://localhost:3001/health || exit 1`, and applies `LABEL maintainer="analytics-engine"`.

### VERIFY: AE-INFRA-002 — docker-compose with PostgreSQL 16 healthcheck

`docker-compose.yml` defines a PostgreSQL 16 service with a healthcheck using `pg_isready -U postgres`. The healthcheck configuration includes `interval: 5s`, `timeout: 5s`, `retries: 5`. A named volume (`pgdata`) provides persistent storage. The API service depends on the database with `condition: service_healthy` to ensure the database is ready before the application starts. `docker-compose.test.yml` extends the base configuration for integration test execution with a separate test database. The `.env.example` file documents all required environment variables.

### VERIFY: AE-INFRA-003 — CI pipeline: lint + test + build + typecheck + audit

The GitHub Actions CI workflow (`.github/workflows/ci.yml`) runs five jobs: `lint` (ESLint via `pnpm turbo run lint`), `test` (Jest via `pnpm turbo run test`), `build` (compilation via `pnpm turbo run build`), `typecheck` (TypeScript via `pnpm turbo run typecheck`), and `audit` (dependency audit via `pnpm audit --audit-level=high`). The workflow uses a PostgreSQL 16 service container with healthcheck for integration tests. Node.js version is pinned to 20.x. The workflow triggers on push to main and pull request events.

### VERIFY: AE-INFRA-004 — Environment validation at startup via validateEnvVars

The application validates required environment variables at startup using `validateEnvVars()` imported from the shared package. This function checks for the presence of `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, and `NODE_ENV`. Missing variables cause immediate process termination via `process.exit(1)` with a descriptive error message listing which variables are missing. No environment variable uses a hardcoded fallback — all use `??` with validation or strict env lookup, never `|| 'default_value'` patterns.

---

## Dockerfile Stages

```dockerfile
# Stage 1: deps — install dependencies
FROM node:20-alpine AS deps
COPY turbo.json pnpm-workspace.yaml pnpm-lock.yaml package.json ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: build — generate prisma client then compile
FROM deps AS build
COPY . .
RUN pnpm prisma generate
RUN pnpm turbo run build

# Stage 3: production — runtime
FROM node:20-alpine AS production
USER node
HEALTHCHECK CMD wget -q --spider http://localhost:3001/health || exit 1
LABEL maintainer="analytics-engine"
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret for JWT access token signing |
| JWT_REFRESH_SECRET | Yes | Secret for refresh token signing |
| CORS_ORIGIN | Yes | Allowed CORS origin URL |
| NODE_ENV | Yes | Environment (development/production) |
| PORT | No | Server port (default via shared config) |

---

## Monorepo Configuration

The project uses Turborepo with pnpm workspaces:
- `turbo.json`: defines build, lint, test, typecheck pipelines with dependencies
- `pnpm-workspace.yaml`: declares `apps/*` and `packages/*` workspaces
- Root `package.json`: includes `turbo` in `devDependencies` and `packageManager` field
- All workspace packages reference shared via `"@analytics-engine/shared": "workspace:*"`
