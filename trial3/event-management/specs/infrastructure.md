# Infrastructure Specification

## Overview

The Event Management platform uses Docker for containerization, GitHub Actions for CI/CD,
Prisma migrations for schema management, and pnpm workspaces with Turborepo for monorepo management.

## Requirements

### VERIFY:EM-INFRA-001
Seed script (prisma/seed.ts) must:
- Import BCRYPT_SALT_ROUNDS from @event-management/shared
- Include error/failure state data (cancelled events, failed notifications, cancelled registrations)
- Use main() + $disconnect pattern with console.error + process.exit(1) error handling

### VERIFY:EM-INFRA-002
Dockerfile must be multi-stage (deps -> build -> production).
Must use node:20-alpine base image.
Must include USER node, HEALTHCHECK, and LABEL maintainer.
Must COPY turbo.json in deps stage.

### VERIFY:EM-INFRA-003
CI workflow (.github/workflows/ci.yml) must include:
- lint job
- typecheck job
- test job with PostgreSQL service container
- build job
- migration-check job
- audit job (pnpm audit --audit-level=high)
CI must use pnpm turbo run for build/test/lint commands.

## Docker Configuration

### Multi-Stage Build
1. **deps** stage: installs dependencies with frozen lockfile
2. **build** stage: compiles TypeScript and builds applications
3. **production** stage: minimal runtime with compiled output

### Security
- Runs as non-root user (USER node)
- Health check via wget to /health endpoint
- Alpine-based for minimal attack surface

## CI/CD Pipeline

### Jobs
- **lint**: runs ESLint via turbo
- **typecheck**: runs tsc --noEmit via turbo
- **test**: runs test suite with PostgreSQL service container
- **build**: compiles all packages and applications
- **migration-check**: verifies migration files exist
- **audit**: runs pnpm audit --audit-level=high

### PostgreSQL Service Container
- Image: postgres:16-alpine
- Health check: pg_isready
- Environment variables for test database

## Monorepo Structure

### Workspace Layout
- apps/api — NestJS backend application
- apps/web — Next.js frontend application
- packages/shared — Shared utilities and constants

### Shared Package Exports (>= 8 consumed)
- APP_VERSION — used in health endpoint, settings page, actions.ts
- BCRYPT_SALT_ROUNDS — used in auth service, seed script
- ALLOWED_REGISTRATION_ROLES — used in auth service, register DTO
- DEFAULT_PAGE_SIZE — used in pagination utility
- createCorrelationId — used in correlation middleware
- formatLogEntry — used in request logging middleware
- sanitizeLogContext — used in global exception filter
- validateEnvVars — used in main.ts bootstrap
- clampPagination — used in pagination utility

### Package Resolution
- ORM packages use >=6.0.0 <7.0.0 ranges (no caret)
- turbo in root devDependencies
- workspace:* protocol for internal dependencies

## Seed Data

The seed script creates a complete demo dataset including:
- Organization with PRO tier
- Admin, Organizer, and Attendee users
- Physical and virtual venues
- Events in different statuses (REGISTRATION_OPEN, DRAFT, CANCELLED)
- Ticket types with pricing
- Event sessions
- Registrations (confirmed and cancelled)
- Waitlist entries
- Notifications (sent and failed)
- Audit log entries
