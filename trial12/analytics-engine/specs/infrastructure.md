# Infrastructure Specification

## Overview

The Analytics Engine infrastructure includes Docker containerization, CI/CD pipeline,
database migrations with Row Level Security, and environment configuration. The
monorepo uses Turborepo with pnpm workspaces.

See also: [Data Model](data-model.md) for schema and migration details.
See also: [Security Specification](security.md) for RLS and audit requirements.

## Docker

### Dockerfile
- Multi-stage build: deps, build, production
- Base image: node:20-alpine
- USER node for security
- HEALTHCHECK with wget to /health endpoint
- LABEL maintainer for image metadata
- COPYs turbo.json in deps stage for workspace resolution

### Docker Compose
- PostgreSQL 16 service with healthcheck and named volume
- API service with environment configuration
- Depends on healthy database before starting

### Docker Compose Test
- Separate PostgreSQL instance for test isolation
- Different port to avoid conflicts

## CI/CD Pipeline

GitHub Actions workflow with PostgreSQL service container:
1. Lint — pnpm turbo run lint
2. Type check — pnpm turbo run typecheck
3. Build — pnpm turbo run build
4. Test — pnpm turbo run test
5. Migration check — prisma migrate diff
6. Audit — pnpm audit --audit-level=high

## Requirements

- VERIFY: AE-INFRA-001 — Seed script uses BCRYPT_SALT_ROUNDS from shared and includes error states
- VERIFY: AE-INFRA-002 — Environment validation at startup via validateEnvVars from shared

## Environment Configuration

Required environment variables:
- DATABASE_URL — PostgreSQL connection with connection_limit
- JWT_SECRET — JWT signing key (no hardcoded fallback)
- CORS_ORIGIN — Allowed CORS origin (no fallback)

Optional:
- PORT — API server port
- API_URL — Backend URL for frontend
- NODE_ENV — Runtime environment

## Monorepo Structure

- Root: turbo.json, pnpm-workspace.yaml, package.json with packageManager
- turbo in root devDependencies
- apps/api/ — NestJS API application
- apps/web/ — Next.js frontend application
- packages/shared/ — Shared utilities and constants

## Shared Package Exports

8+ consumed exports from packages/shared:
- BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES
- MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, APP_VERSION
- createCorrelationId, formatLogEntry, sanitizeLogContext
- validateEnvVars, clampPageSize, clampPage, calculateSkip

## Database Migrations

- Initial migration creates all tables with indexes
- RLS enabled and forced on all tables
- CREATE POLICY for each table using tenant_id comparison
- No ::uuid cast on TEXT columns
