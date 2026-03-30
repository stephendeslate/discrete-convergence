# Infrastructure Specification

## Overview

The Analytics Engine uses a containerized deployment model with Docker multi-stage
builds, PostgreSQL for persistence, and pnpm workspaces with Turborepo for monorepo
management. CI/CD is handled via GitHub Actions with parallel test and lint stages.

See also: monitoring.md for health check and readiness probe details.
See also: security.md for environment variable validation and secret management.

## Monorepo Structure

```
analytics-engine/
  apps/
    api/          - NestJS 11 backend
    web/          - Next.js 15 frontend
  packages/
    shared/       - Shared utilities, constants, validators
  specs/          - Specification documents
```

- pnpm workspaces with packages defined in pnpm-workspace.yaml
- Turborepo for task orchestration (build, test, lint, typecheck)
- Shared package consumed via workspace:* protocol

VERIFY: AE-INFRA-001 — Dockerfile uses multi-stage build with HEALTHCHECK instruction
VERIFY: AE-INFRA-002 — Docker Compose includes PostgreSQL with health check and proper env vars

## Dockerfile

Multi-stage build with three stages:
1. deps: Install pnpm dependencies
2. build: Run prisma generate + tsc compilation
3. production: Copy dist + node_modules, set HEALTHCHECK

Key requirements:
- Base image: node:20-slim
- HEALTHCHECK using curl to /health endpoint
- prisma generate runs before tsc build
- Non-root user for production stage
- PORT exposed via ENV with default 3001

## Docker Compose

### docker-compose.yml (Development)
- api service: builds from Dockerfile, maps PORT, depends on postgres
- postgres service: PostgreSQL 16, health check with pg_isready
- Volumes for persistent data
- Environment variables from .env.example

### docker-compose.test.yml (Testing)
- Extends base compose with test-specific overrides
- Separate test database
- Runs pnpm turbo run test on completion

## Environment Variables

Required variables (validated at startup via validateEnvVars):
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Secret for access token signing
- JWT_REFRESH_SECRET: Secret for refresh token signing
- CORS_ORIGIN: Allowed CORS origin
- PORT: API server port (default 3001)

VERIFY: AE-SEC-005 — Environment variables validated at startup before server listen

## CI/CD Pipeline

GitHub Actions workflow (.github/workflows/ci.yml):
1. Install: pnpm install with frozen lockfile
2. Build: pnpm turbo run build (parallel package builds)
3. Lint: pnpm turbo run lint
4. Test: pnpm turbo run test with coverage
5. Typecheck: pnpm turbo run typecheck

Triggered on: push to main, pull request to main

## Build Configuration

### API (NestJS)
- tsconfig.build.json: rootDir "src", outDir "dist"
- nest-cli.json: points to tsconfig.build.json
- Output: dist/main.js (flat structure)

### Web (Next.js)
- next.config.ts: transpilePackages for shared
- Output: .next/ directory

### Shared
- tsconfig.json: outDir "dist", declaration: true
- Output: dist/index.js with .d.ts files

## Turborepo Tasks

- build: depends on ^build (shared builds first)
- test: depends on build
- lint: independent (parallel)
- typecheck: depends on ^build
