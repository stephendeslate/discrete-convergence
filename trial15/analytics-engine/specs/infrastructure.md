# Infrastructure Specification

## Overview

The Analytics Engine uses Docker for containerization, GitHub Actions for CI/CD, and Turborepo for monorepo management. Infrastructure files are generated before application code per CED methodology requirements.

See also: [security.md](security.md) for audit configuration, [monitoring.md](monitoring.md) for health checks.

## Docker

VERIFY: AE-INFRA-001 — main.ts calls validateEnvVars at startup before creating NestFactory

### Dockerfile
- Multi-stage build: deps, build, production
- Base image: node:20-alpine
- LABEL maintainer for image metadata
- USER node for security (non-root)
- HEALTHCHECK with wget to /health endpoint
- Copies turbo.json in deps stage for workspace resolution

### Docker Compose
- PostgreSQL 16 Alpine with healthcheck
- API service depends on postgres with service_healthy condition
- Named volume for database persistence
- No hardcoded secrets (uses environment variables)

### Docker Compose Test
- Separate PostgreSQL instance for testing on port 5433

## CI/CD Pipeline

VERIFY: AE-INFRA-002 — Monitoring controller health endpoints are @Public and @SkipThrottle

### GitHub Actions Workflow
Jobs:
1. **lint** — pnpm turbo run lint
2. **typecheck** — pnpm turbo run typecheck
3. **test** — pnpm turbo run test (with PostgreSQL service container)
4. **build** — pnpm turbo run build
5. **migration-check** — verify migrations directory exists
6. **audit** — pnpm audit --audit-level=high

All jobs use:
- Node.js 20
- pnpm with cache
- Frozen lockfile for reproducible installs

## Database Seed

VERIFY: AE-INFRA-003 — Seed imports BCRYPT_SALT_ROUNDS from shared, creates tenant, admin, viewer, and error state data

### Seed Data
- Demo tenant
- Admin user (admin@demo.com)
- Viewer user (viewer@demo.com)
- Published dashboard with widgets
- Archived dashboard (error/failure state data)
- Data source with connection info

### Error Handling
- main() with try/catch
- console.error for failures
- process.exit(1) on error
- prisma.$disconnect() in finally

## Environment Configuration

Required variables (.env.example):
- DATABASE_URL with connection_limit
- JWT_SECRET
- CORS_ORIGIN
- API_URL
- NODE_ENV
- PORT
- BCRYPT_SALT_ROUNDS
