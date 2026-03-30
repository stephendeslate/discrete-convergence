# Infrastructure Specification

## Overview

Fleet Dispatch uses Docker for containerization, GitHub Actions for CI/CD,
and Prisma migrations for database schema management. The infrastructure
supports the monorepo structure with Turborepo and pnpm workspaces.

## Docker

- VERIFY: FD-INFRA-001 — Multi-stage Dockerfile: deps, build, production
- VERIFY: FD-INFRA-002 — Dockerfile uses node:20-alpine with USER node
- VERIFY: FD-INFRA-003 — Dockerfile includes HEALTHCHECK and LABEL maintainer

### Dockerfile Stages
1. **deps**: Install dependencies with pnpm, copy turbo.json
2. **build**: Compile TypeScript, build NestJS application
3. **production**: Copy built artifacts, run as non-root user

## Docker Compose

- VERIFY: FD-INFRA-004 — docker-compose.yml with PostgreSQL 16 service
- VERIFY: FD-INFRA-005 — PostgreSQL healthcheck and named volume

### Services
- **db**: PostgreSQL 16 with healthcheck
- **api**: NestJS API depending on db service
- **web**: Next.js frontend

## CI/CD Pipeline

- VERIFY: FD-INFRA-006 — GitHub Actions CI with lint, test, build, typecheck, audit

### Pipeline Steps
1. Install pnpm and dependencies
2. Run lint (pnpm turbo run lint)
3. Run typecheck (pnpm turbo run typecheck)
4. Run tests with PostgreSQL service container
5. Run build (pnpm turbo run build)
6. Run pnpm audit --audit-level=high

## Database Migrations

- VERIFY: FD-INFRA-007 — Prisma migration with RLS policies for all domain tables

Migrations include:
- Table creation for all models
- ENABLE ROW LEVEL SECURITY on domain tables
- FORCE ROW LEVEL SECURITY on domain tables
- CREATE POLICY for tenant isolation
- Indexes on tenantId, status, and composite fields

See [Data Model Specification](data-model.md) for schema details.

## Seed Data

- VERIFY: FD-INFRA-008 — Seed script with error handling and BCRYPT_SALT_ROUNDS from shared

### Seed Requirements
- main() function with disconnect in finally block
- console.error + process.exit(1) error handling
- Creates admin user, dispatcher, driver users
- Creates sample vehicles, drivers, dispatches
- Includes error/failure state data (cancelled dispatch, retired vehicle)
- Imports BCRYPT_SALT_ROUNDS from @fleet-dispatch/shared

## Environment Variables

- VERIFY: FD-INFRA-009 — .env.example with all required variables documented

### Required Variables
- DATABASE_URL (with connection_limit)
- JWT_SECRET
- CORS_ORIGIN
- PORT
- API_URL (for frontend)
- NODE_ENV

## Monorepo Configuration

- Turborepo for task orchestration
- pnpm workspaces for dependency management
- Shared package consumed by both apps
