# Infrastructure Specification

## Overview

Fleet Dispatch uses Docker for containerization, GitHub Actions for CI/CD,
and pnpm with Turborepo for monorepo management. The application runs on
Node.js 20 with PostgreSQL 16 as the database.

## Application Bootstrap

<!-- VERIFY: FD-INFRA-001 -->
The `main.ts` entry point configures the NestJS application with:
- `validateEnvVars()` from the shared package to ensure all required environment
  variables are present before the application starts
- `helmet()` middleware with Content Security Policy for HTTP security headers
- `enableCors()` with `CORS_ORIGIN` from environment (no fallback)
- `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and
  `transform: true` to strip unknown properties and transform payloads

The application listens on port 3001 by default.

## Environment Validation

<!-- VERIFY: FD-INFRA-002 -->
The `validateEnvVars()` function in the shared package checks for the presence
of required environment variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.
If any required variable is missing, it throws an error with a descriptive
message listing the missing variables. This prevents the application from
starting in a misconfigured state.

## Docker Configuration

The multi-stage Dockerfile follows best practices:
1. **deps stage**: `node:20-alpine`, installs pnpm, copies package files, runs
   `pnpm install --frozen-lockfile`
2. **build stage**: Copies source code and turbo.json, runs `pnpm turbo run build`
3. **production stage**: `node:20-alpine`, copies built artifacts, sets `USER node`,
   includes `HEALTHCHECK` directive, adds `LABEL maintainer`

The `.dockerignore` excludes node_modules, .git, coverage, and other build artifacts.

## Docker Compose

The `docker-compose.yml` defines:
- PostgreSQL 16 service with health check (`pg_isready`)
- Named volume `pgdata` for data persistence
- Environment variables for database credentials

The `docker-compose.test.yml` extends the base configuration for test environments
with ephemeral database volumes.

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) defines jobs:
1. **lint**: Runs `pnpm turbo run lint` with ESLint 9 flat config
2. **typecheck**: Runs `pnpm turbo run typecheck` for TypeScript validation
3. **test**: Runs `pnpm turbo run test` with a PostgreSQL service container
4. **build**: Runs `pnpm turbo run build` to verify production builds
5. **migration-check**: Validates Prisma migration files are in sync
6. **audit**: Runs `pnpm audit` to check for known vulnerabilities

All jobs use `pnpm` with caching for fast installs.

## Monorepo Structure

The Turborepo configuration (`turbo.json`) defines task dependencies:
- `build` depends on `^build` (workspace dependencies built first)
- `test` depends on `build`
- `lint` and `typecheck` run independently

The `pnpm-workspace.yaml` declares two workspace patterns:
- `apps/*` — API and web applications
- `packages/*` — Shared packages

## Cross-References

- Environment variables listed in `.env.example`: see [security.md](security.md)
- Database connection via Prisma: see [data-model.md](data-model.md) (FD-DATA-001)
- Health check endpoint used by Docker: see [monitoring.md](monitoring.md) (FD-MON-007)
- Prisma version pinning (>=6.0.0 <7.0.0): see root package.json overrides

## Dependency Management

Key dependency decisions:
- `bcryptjs` (pure JS) instead of `bcrypt` to avoid native build issues
- `pnpm.overrides` for `effect>=3.20.0` to fix Prisma transitive vulnerability
- Prisma ORM pinned to `>=6.0.0 <7.0.0` range for schema stability
- ESLint 9 with flat config format (`eslint.config.mjs`, not `.eslintrc.json`)
