# Infrastructure Specification

## Overview

The Event Management platform uses Docker for containerization, GitHub Actions for CI/CD,
and Turborepo for monorepo management with pnpm workspaces.

## Docker

VERIFY: EM-INFRA-001 — validateEnvVars validates required environment variables at startup

VERIFY: EM-INFRA-002 — Shared package exports >= 8 utilities consumed by apps

VERIFY: EM-INFRA-003 — AppModule registers ThrottlerGuard, JwtAuthGuard, RolesGuard as APP_GUARD, GlobalExceptionFilter as APP_FILTER, ResponseTimeInterceptor as APP_INTERCEPTOR

VERIFY: EM-INFRA-004 — main.ts bootstraps with Helmet, CORS, ValidationPipe, and env validation

### Dockerfile
Multi-stage build:
1. deps stage: node:20-alpine, copies package manifests, runs pnpm install
2. build stage: copies source, runs turbo build
3. production stage: copies dist, sets USER node, adds HEALTHCHECK and LABEL

### Docker Compose
- PostgreSQL 16 Alpine with healthcheck and named volume
- API service depending on healthy database
- Environment variables for DATABASE_URL, JWT_SECRET, CORS_ORIGIN

## CI/CD

### GitHub Actions Workflow
Jobs: lint, typecheck, build, test, audit
- Uses PostgreSQL 16 service container
- Uses pnpm turbo run for all tasks
- Runs pnpm audit --audit-level=high

## Monorepo Structure

Turborepo configuration with pnpm workspaces:
- apps/api/ — NestJS backend
- apps/web/ — Next.js frontend
- packages/shared/ — Shared constants, utilities, types

### Shared Package Exports
- BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE
- APP_VERSION
- createCorrelationId, formatLogEntry, sanitizeLogContext
- validateEnvVars, parsePagination

## Database

### Prisma
- ORM pinned to >=6.0.0 <7.0.0
- Schema includes @@map for all models and enums
- @@index on tenantId, status, and composite fields
- Decimal @db.Decimal(12, 2) for monetary fields

### Migrations
- Initial migration creates all tables with proper types
- RLS policies use TEXT comparison (no ::uuid cast)

### Seed
- Creates admin, organizer, and user accounts
- Creates venues, events (published, cancelled, draft)
- Creates tickets, attendees, and schedules
- Error handling with process.exit(1) on failure
- Imports BCRYPT_SALT_ROUNDS from shared

## Environment Variables

Required in production: DATABASE_URL, JWT_SECRET, CORS_ORIGIN
Optional: PORT (default 3001), NODE_ENV, API_URL
