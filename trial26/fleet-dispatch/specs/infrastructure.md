# Infrastructure Specification

## Overview

The Fleet Dispatch platform uses Docker for containerization, PostgreSQL 16 for
the database, and GitHub Actions for CI/CD. The monorepo is managed with pnpm
workspaces and Turborepo for build orchestration.

## Docker

### Dockerfile (Multi-stage)
- Stage 1 (base): node:20-alpine with pnpm setup
- Stage 2 (deps): Install production dependencies
- Stage 3 (builder): Build all packages
- Stage 4 (runner): Minimal runtime image
- HEALTHCHECK: curl --fail http://localhost:3001/health
- LABEL: maintainer information
- COPY: packages/shared for runtime access

### Docker Compose (docker-compose.yml)
- db service: postgres:16-alpine
  - Health check: pg_isready
  - Volume: pgdata for persistence
  - Environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- api service: built from Dockerfile
  - Depends on db (service_healthy)
  - Ports: 3001:3001
  - Environment: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

### Docker Compose Test (docker-compose.test.yml)
- test-db service: postgres:16-alpine
  - Separate database for testing
  - No persistent volume

### .dockerignore
- node_modules, .git, dist, coverage, .env
- Reduces build context size

## CI/CD (GitHub Actions)

### Workflow: .github/workflows/ci.yml
- Triggers: push to main, pull requests
- Steps:
  1. Checkout repository
  2. Setup pnpm with caching
  3. Install dependencies
  4. Run lint (pnpm run lint)
  5. Run typecheck (pnpm run typecheck)
  6. Run tests (pnpm run test)
  7. Upload coverage artifacts

## Monorepo Structure

### pnpm Workspace
- apps/api — NestJS API
- apps/web — Next.js frontend
- packages/shared — Shared types and utilities

### Turborepo (turbo.json)
- build: depends on ^build
- test: depends on build
- lint: no dependencies
- typecheck: no dependencies
- dev: cache disabled, persistent

### Root package.json
- pnpm.overrides: effect>=3.20.0, picomatch>=4.0.4
- onlyBuiltDependencies: [prisma, @prisma/engines, @prisma/client]
- devDependencies: jscpd for copy-paste detection

## Database

### PostgreSQL 16
- Row-Level Security on all tenanted tables
- Migration managed by Prisma
- Seed script for development data
- Connection via DATABASE_URL environment variable

### Prisma Configuration
- Generator: prisma-client-js
- Datasource: postgresql
- Migration directory: prisma/migrations
