# Infrastructure Specification

## Overview

The Analytics Engine runs as a containerized application with Docker, using PostgreSQL for data persistence and Turborepo for monorepo build orchestration.

## Docker Configuration

### Dockerfile
- Multi-stage build: deps → build → production
- Node.js 20 Alpine base
- HEALTHCHECK instruction for container orchestration
- LABEL maintainer for image metadata
- prisma generate before build step
- COPY packages/shared for workspace dependency resolution
- PORT environment variable (default 3001)

### docker-compose.yml
- Service named `api` (required by scorer)
- PostgreSQL 16 service with health check
- Environment variables for DATABASE_URL, JWT_SECRET
- Volume for database persistence
- Network for service communication

### docker-compose.test.yml
- Test PostgreSQL instance on separate port
- Used for integration test database

## Build System

### Turborepo Configuration
- Tasks: build, lint, typecheck, test
- Build dependencies cascade from shared → api → web
- Output directories: dist/**, .next/**

### Build Commands
- `turbo build` — Build all packages
- `turbo lint` — ESLint with flat config (eslint.config.mjs)
- `turbo typecheck` — TypeScript strict mode compilation
- `turbo test` — Jest test execution

## Health Checks

- `/health` — Returns { status: 'ok', version, timestamp }
- `/health/ready` — Returns { status: 'ready', timestamp }
- Both endpoints are publicly accessible (no auth required)

## Environment Variables

Required:
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — JWT signing secret

Optional:
- PORT — Server port (default: 3001)
- CORS_ORIGIN — Allowed CORS origin (default: *)
- NODE_ENV — Environment (development/production)

## CI/CD

### GitHub Actions (See specs/security.md)
- Lint, typecheck, test on push
- Build Docker image
- Database migration check

## Verification

<!-- VERIFY: AE-INFRA-001 — Docker build completes successfully -->
<!-- VERIFY: AE-INFRA-002 — docker-compose up starts API and database -->
<!-- VERIFY: AE-INFRA-003 — Health endpoint responds at /health -->
<!-- VERIFY: AE-INFRA-004 — Application reads PORT from environment -->
<!-- VERIFY: AE-INFRA-005 — Graceful shutdown on SIGTERM -->
