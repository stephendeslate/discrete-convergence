# Infrastructure Specification

## Overview

The Event Management platform uses Docker for containerization and GitHub Actions for CI/CD.
Infrastructure supports the monitoring requirements described in [monitoring.md](monitoring.md).
The deployment model follows security best practices from [security.md](security.md).

## Requirements

### EM-INFRA-001 — Docker Build
Multi-stage Dockerfile with base, deps, builder, and runner stages.
Builder installs dependencies and compiles TypeScript.
Runner uses node:20-alpine slim image for minimal attack surface.
Shared package files copied to runner stage for runtime access.
<!-- VERIFY:EM-INFRA-001 — Dockerfile uses multi-stage build with slim runner image -->

### EM-INFRA-002 — Docker Health Check
Dockerfile includes HEALTHCHECK instruction using wget to /health endpoint.
HEALTHCHECK configured with interval=30s, timeout=10s, start-period=5s, retries=3.
LABEL maintainer is specified for image identification.
<!-- VERIFY:EM-INFRA-002 — Docker HEALTHCHECK and LABEL maintainer configured -->

### EM-INFRA-003 — Docker Compose
docker-compose.yml defines "api" and "db" services.
API service depends on db with health check condition (service_healthy).
Database uses PostgreSQL 16-alpine image with health checks.
Persistent volume configured for database data.
<!-- VERIFY:EM-INFRA-003 — Docker Compose defines api and db services with health dependency -->

### EM-INFRA-004 — CI Pipeline
GitHub Actions workflow runs lint, test, and build on push and pull request.
Uses pnpm for package management with action-setup.
PostgreSQL service container for integration tests.
Node.js 20 with pnpm 9 configured.
<!-- VERIFY:EM-INFRA-004 — CI pipeline runs lint, test, and build with pnpm caching -->

### EM-INFRA-005 — Environment Configuration
.env.example documents all required environment variables.
Application reads PORT from process.env['PORT'] ?? '3001'.
No || 'fallback' patterns for environment variables.
validateEnvVars() called at bootstrap to fail fast on missing config.
<!-- VERIFY:EM-INFRA-005 — Environment variables documented and accessed safely -->

### EM-INFRA-006 — Monorepo Structure
pnpm workspace with Turborepo orchestration.
Packages: apps/api, apps/web, packages/shared.
Turbo tasks: build, lint, test, typecheck with proper dependency graph.
Shared package consumed directly as TypeScript source.
<!-- VERIFY:EM-INFRA-006 — Monorepo configured with pnpm workspaces and Turborepo -->

## Docker Compose Services

| Service | Image | Ports | Health Check |
|---------|-------|-------|-------------|
| api | Custom (Dockerfile) | 3001:3001 | via Dockerfile HEALTHCHECK |
| db | postgres:16-alpine | 5432:5432 | pg_isready |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| JWT_SECRET | Yes | - | JWT signing secret |
| JWT_REFRESH_SECRET | Yes | - | JWT refresh token secret |
| PORT | No | 3001 | API server port |
| CORS_ORIGIN | No | http://localhost:3000 | Allowed CORS origin |
| NODE_ENV | No | development | Runtime environment |
