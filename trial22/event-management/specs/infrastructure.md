# Infrastructure Specification

## Overview

Monorepo managed by Turborepo with pnpm workspaces. Docker multi-stage build
for production deployment. PostgreSQL database with Prisma ORM.

## Monorepo Structure

```
event-management/
  apps/api/     — NestJS 11 API
  apps/web/     — Next.js 15 Frontend
  packages/shared/ — Shared utilities
```

### Build Pipeline
- Turborepo orchestrates build/lint/test across all packages
- `packages/shared` builds first (depended on by both apps)
- ESLint 9 flat config in each package

## Docker

### Multi-stage Dockerfile
1. **base** — Node 20 Alpine with pnpm
2. **deps** — Install dependencies with frozen lockfile
3. **build** — Prisma generate + TypeScript compilation
4. **production** — Minimal runtime image

### Production Image
- `USER node` for security
- `HEALTHCHECK` instruction for container orchestration
- Copies `packages/shared/package.json` and `packages/shared/dist`
- CMD: `node apps/api/dist/main.js`

### Docker Compose
- `docker-compose.yml` — API + PostgreSQL with healthcheck
- `docker-compose.test.yml` — Test PostgreSQL on port 5433

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
- Lint, typecheck, test, build, audit

## Shared Package

VERIFY: EM-SHARED-001 — Exports APP_VERSION, BCRYPT_SALT_ROUNDS constants
VERIFY: EM-SHARED-002 — Exports sanitizeLogContext, formatLogEntry, createCorrelationId
VERIFY: EM-SHARED-003 — Exports validateEnvVars, clampPagination, getPaginationSkip

### Consumed Exports (8+)
1. APP_VERSION — layout.tsx
2. BCRYPT_SALT_ROUNDS — auth.service.ts, seed.ts
3. MAX_PAGE_SIZE — paginated-query.ts
4. DEFAULT_PAGE_SIZE — actions.ts
5. ALLOWED_REGISTRATION_ROLES — register.dto.ts
6. createCorrelationId — correlation-id.middleware.ts
7. formatLogEntry — request-logging.middleware.ts
8. sanitizeLogContext — global-exception.filter.ts
9. validateEnvVars — main.ts
10. clampPagination — all services
11. getPaginationSkip — all services

## Database Management

- Prisma schema at `apps/api/prisma/schema.prisma`
- Migrations at `apps/api/prisma/migrations/`
- Seed at `apps/api/prisma/seed.ts` with main() + disconnect pattern

## Environment Variables

Documented in `.env.example` with 7 variables:
DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, PORT, CORS_ORIGIN, API_URL, NODE_ENV

## Related Specs

See [data-model.md](data-model.md) for schema details.
See [monitoring.md](monitoring.md) for health check configuration.
