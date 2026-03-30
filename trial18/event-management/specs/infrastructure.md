# Infrastructure Specification

## Overview

The event management platform is containerized using Docker with multi-stage builds.
Infrastructure includes Docker Compose for local development, GitHub Actions for CI/CD,
Prisma migrations for database schema management, and seed data for development.

## Docker

### Dockerfile
- Multi-stage build: deps -> build -> production
- Base image: node:20-alpine
- Non-root user: `USER node`
- HEALTHCHECK endpoint: /health
- LABEL maintainer for image metadata
- Copies turbo.json in deps stage for monorepo builds

### Docker Compose
- PostgreSQL 16 with healthcheck and named volume
- API service depends on healthy database
- Environment variables injected from host

## CI/CD Pipeline

GitHub Actions workflow runs on push and PR to main:
1. Lint — ESLint with flat config
2. Typecheck — tsc --noEmit
3. Build — turbo build
4. Test — turbo test with PostgreSQL service container
5. Migration check — prisma migrate diff
6. Audit — pnpm audit --audit-level=high

## Environment Variables

- VERIFY: EM-INFRA-001 — validateEnvVars validates required env vars at startup
- VERIFY: EM-INFRA-002 — main.ts bootstraps app with Helmet, CORS, ValidationPipe

### Required Variables
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection with connection_limit |
| JWT_SECRET | Secret for JWT signing (no fallback) |
| CORS_ORIGIN | Allowed CORS origin |
| PORT | Server port (defaults to 3001) |
| NODE_ENV | Environment (development/production/test) |

## Database Migrations

- Initial migration creates all tables with proper indexes
- Row Level Security enabled on all tenant-scoped tables
- RLS policies use TEXT comparison (no ::uuid cast)
- Dummy tenant ID set during migration for policy creation

## Seed Data

- Creates demo tenant, admin user, viewer user
- Creates sample venues, events (published, cancelled, draft)
- Creates sample attendees and registrations
- Imports BCRYPT_SALT_ROUNDS from shared package
- Includes error/failure state data for testing

## Cross-References

- See [data-model.md](data-model.md) for schema definitions
- See [security.md](security.md) for audit and vulnerability management
- See [monitoring.md](monitoring.md) for health check endpoints
