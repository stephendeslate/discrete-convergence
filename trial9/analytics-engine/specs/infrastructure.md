# Infrastructure Specification

## Overview

The Analytics Engine infrastructure uses Docker for containerization, GitHub Actions
for CI/CD, and Prisma for database migrations. The monorepo is managed with
Turborepo and pnpm workspaces.

## Docker

### Dockerfile
- Multi-stage build: deps → build → production
- Base image: node:20-alpine
- USER node for security
- HEALTHCHECK on /health endpoint
- LABEL maintainer for identification
- COPYs turbo.json in deps stage for efficient caching

### Docker Compose
- PostgreSQL 16 with healthcheck and named volume
- API service with environment variable configuration
- Depends on PostgreSQL service health

### Docker Compose Test
- Separate PostgreSQL instance for test isolation

## CI/CD Pipeline

- VERIFY: AE-ARCH-001 — AppModule configures global providers (APP_GUARD, APP_FILTER, APP_INTERCEPTOR)
- Jobs: lint, typecheck, test, build, migration-check, audit
- PostgreSQL service container for test and migration jobs
- Uses pnpm turbo run for all build tasks
- pnpm audit --audit-level=high in audit job

## Database Migrations

- Initial migration creates all tables, enums, indexes
- Row Level Security enabled on all tables
- CREATE POLICY for tenant isolation on every table
- Migration sets dummy tenant_id for policy creation safety

## Environment Variables

Required:
- DATABASE_URL — PostgreSQL connection string with connection_limit
- JWT_SECRET — secret key for JWT signing
- CORS_ORIGIN — allowed CORS origin

Optional:
- PORT — server port (default: 3001)
- NODE_ENV — environment (development/production/test)
- LOG_LEVEL — pino log level (default: info)
- API_URL — internal API URL for frontend

## Monorepo Structure

### Packages
- apps/api — NestJS backend
- apps/web — Next.js frontend
- packages/shared — shared constants and utilities

### Shared Package Exports (8+)
- BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES
- MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, APP_VERSION
- createCorrelationId, formatLogEntry, sanitizeLogContext
- validateEnvVars, parsePagination

### Turborepo Configuration
- Build task depends on ^build (shared builds first)
- Lint, test, typecheck tasks configured
- turbo in root devDependencies

## Seed Data

- Admin user, regular user, and locked user (error state)
- Published and archived dashboards
- Data source, widget, and metrics (including zero-value error state)
- Uses BCRYPT_SALT_ROUNDS from shared for password hashing
- Error handling: catch → stderr → process.exit(1)
- Cleanup: finally → prisma.$disconnect()
