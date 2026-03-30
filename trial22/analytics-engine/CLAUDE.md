# Analytics Engine - Development Guide

## Project Overview

Multi-tenant embeddable analytics platform built with:
- **Backend**: NestJS 11 with Prisma 6, PostgreSQL, JWT auth
- **Frontend**: Next.js 15 with App Router, React 19
- **Shared**: @repo/shared workspace package with utilities
- **Build**: pnpm workspaces + Turborepo

## Quick Start

```bash
pnpm install
pnpm turbo run build
pnpm turbo run test
pnpm turbo run lint
```

## Architecture

### Backend (apps/api)
- NestJS 11 with global guards (ThrottlerGuard, JwtAuthGuard, RolesGuard)
- Global filter (GlobalExceptionFilter) and interceptor (ResponseTimeInterceptor)
- Prisma 6 ORM with PostgreSQL and Row-Level Security (RLS)
- JWT authentication with 1h access tokens, 7d refresh tokens
- Multi-tenancy via setTenantContext() using parameterized SQL

### Frontend (apps/web)
- Next.js 15 App Router with server components
- Server actions for API communication (httpOnly cookie token storage)
- Error boundaries (error.tsx) with useRef focus for accessibility
- Loading states (loading.tsx) with role="status"
- 8 reusable UI components

### Shared Package (packages/shared)
- APP_VERSION, BCRYPT_SALT_ROUNDS, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE
- createCorrelationId, sanitizeLogContext, formatLogEntry
- validateEnvVars, parsePagination
- SENSITIVE_KEYS, ALLOWED_REGISTRATION_ROLES

## Key Conventions

### Authentication
- @Public() decorator exempts endpoints from JWT guard
- @Roles('ADMIN') restricts endpoints to admin users
- @Throttle on auth endpoints (10 req/s vs 100 req/s global)
- bcryptjs (not bcrypt) for password hashing

### Database
- Prisma schema with 15 models, all with RLS policies
- Migration includes CREATE TABLE DDL + RLS setup
- Seed script creates admin/viewer users and sample data
- setTenantContext via $executeRaw with Prisma.sql template

### Testing
- Co-located unit tests in src/{module}/*.spec.ts
- Integration tests in test/ using supertest
- Jest with ts-jest, moduleNameMapper for @repo/shared
- Coverage reporters: json-summary, text, lcov

### Code Style
- ESLint 9 flat config (eslint.config.mjs)
- TypeScript strict mode
- TRACED tags in .ts/.tsx files only
- VERIFY tags in .md spec files with AE- prefix

## Environment Variables

Required:
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — Access token signing secret
- JWT_REFRESH_SECRET — Refresh token signing secret

Optional:
- PORT — API port (default 3001)
- CORS_ORIGIN — Allowed origin (default http://localhost:3000)
- API_URL — Backend URL for frontend (default http://localhost:3001)

## Dependency Notes

- Prisma pinned to >=6.0.0 <7.0.0
- pnpm.overrides: effect>=3.20.0, picomatch>=4.0.4
- bcryptjs (pure JS, no native compilation)
- helmet for security headers
- pino for structured logging

## Docker

```bash
docker compose up -d        # Start all services
docker compose -f docker-compose.test.yml up -d  # Test DB
```

Multi-stage Dockerfile:
1. deps — Install dependencies
2. builder — Build shared, generate Prisma, build API
3. runner — Production image with HEALTHCHECK
