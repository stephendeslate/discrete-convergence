# Infrastructure Specification

## Overview

The Analytics Engine uses a Turborepo monorepo with pnpm workspaces. Infrastructure
includes Docker, CI/CD, database migrations, and environment configuration.

See also: [Security](security.md) for audit and dependency management.
See also: [Monitoring](monitoring.md) for health checks and logging.

## Monorepo Structure

The project follows Turborepo conventions:
- apps/api — NestJS backend
- apps/web — Next.js frontend
- packages/shared — Shared constants, utilities, types

## Docker

### Dockerfile
- Multi-stage build: deps -> build -> production
- Base image: node:20-alpine
- USER node for security
- HEALTHCHECK on /monitoring/health
- LABEL maintainer

### docker-compose.yml
- PostgreSQL 16 with healthcheck and named volume
- API service with environment variables
- Connection limit configured in DATABASE_URL

### docker-compose.test.yml
- Separate PostgreSQL instance for testing

## CI/CD

### GitHub Actions (ci.yml)
- Triggered on push/PR to main
- PostgreSQL service container
- Steps: install, lint, typecheck, build, test, migration check, audit
- Uses pnpm turbo run for all build tasks

## Database Migrations

VERIFY: AE-ARCH-001
AppModule configures all providers: auth, dashboard, data-source, widget, monitoring.

VERIFY: AE-ARCH-002
APP_GUARD providers: ThrottlerGuard, JwtAuthGuard, RolesGuard.

VERIFY: AE-ARCH-003
APP_FILTER provider: GlobalExceptionFilter.

VERIFY: AE-ARCH-004
APP_INTERCEPTOR provider: ResponseTimeInterceptor.

## Environment Configuration

Required variables (validated at startup):
- DATABASE_URL — PostgreSQL connection string with connection_limit
- JWT_SECRET — JWT signing secret (no fallback)
- CORS_ORIGIN — Allowed CORS origin (no fallback)
- PORT — Server port (optional, defaults to 3000)
- API_URL — Backend URL for frontend (optional)

## Shared Package

The shared package exports 8+ utilities consumed by both apps:
- BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES
- MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE
- APP_VERSION
- createCorrelationId, formatLogEntry, sanitizeLogContext
- validateEnvVars, parsePagination

## Seed Script

Seed creates admin, user, and viewer accounts with error state data.
Uses BCRYPT_SALT_ROUNDS from shared. Handles errors with process.exit(1).
