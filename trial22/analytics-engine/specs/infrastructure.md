# Infrastructure Specification

## Overview

The Analytics Engine infrastructure supports containerized deployment
with Docker, automated CI/CD via GitHub Actions, and environment-based
configuration.

## Docker

### Dockerfile (Multi-stage)

Stage 1 (deps): Install pnpm dependencies
Stage 2 (builder): Build shared package, run prisma generate, build API
Stage 3 (runner): Production image with:
- Shared package included
- Prisma client generated
- HEALTHCHECK instruction
- Non-root user

VERIFY: AE-INFRA-002 — Dockerfile uses multi-stage build with prisma generate before build

### docker-compose.yml

Services:
- api: NestJS application (port 3001)
- web: Next.js frontend (port 3000)
- db: PostgreSQL 16 (port 5432)

Environment variables passed via .env file.

### docker-compose.test.yml

Services:
- test-db: PostgreSQL 16 for integration tests (port 5433)
- Ephemeral test database for CI

VERIFY: AE-INFRA-003 — Docker Compose includes PostgreSQL service

## CI/CD

### GitHub Actions (.github/workflows/ci.yml)

Jobs:
- lint: ESLint across all packages
- typecheck: TypeScript compilation check
- test: Jest tests with test database
- build: Full turbo build

VERIFY: AE-INFRA-004 — CI pipeline runs lint, typecheck, test, and build

## Environment Configuration

Required variables (validated at startup):
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — Secret for signing access tokens
- JWT_REFRESH_SECRET — Secret for signing refresh tokens

Optional variables:
- PORT — API port (default 3001)
- CORS_ORIGIN — Allowed CORS origin (default http://localhost:3000)
- NODE_ENV — Environment (development/production)
- API_URL — Backend URL for frontend server actions

VERIFY: AE-INFRA-001 — Bootstrap validates required environment variables

## Build System

- pnpm workspaces for monorepo management
- Turborepo for build orchestration
- Build order: shared -> api, web (parallel)
- pnpm.overrides for effect>=3.20.0 and picomatch>=4.0.4

## Startup Sequence

1. validateEnvVars checks required variables
2. NestFactory.create(AppModule)
3. Disable x-powered-by header
4. Apply helmet with CSP (frameAncestors: 'none')
5. Enable CORS with configured origin
6. Apply ValidationPipe (whitelist, forbidNonWhitelisted)
7. Enable shutdown hooks
8. Listen on configured PORT
